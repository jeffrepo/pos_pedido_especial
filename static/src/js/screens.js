odoo.define('pos_pedido_especial.screens', function (require) {
"use strict";

var models = require('point_of_sale.models');
var screens = require('point_of_sale.screens');
var PopupWidget = require('point_of_sale.popups');
var gui = require('point_of_sale.gui');
var rpc = require('web.rpc');
var core = require('web.core');
var QWeb = core.qweb;

models.load_models({
    model: 'account.journal',
    fields: ['direccion','id','name'],
    domain: function(self) {return []},
    loaded: function(self,diarios){
      if (diarios.length > 0) {
        diarios.forEach(function(diar){

          if (diar['id'] == self.config.invoice_journal_id[0]) {
            if (diar['direccion'] != false) {
              //self.diarios = diarios;
              self.diarios = diar['direccion'];
            }
          }

        });
      }
    },
});

models.load_fields('res.company', 'street_name')
models.load_fields('res.company', 'street2')
models.load_fields('res.company', 'l10n_mx_edi_colony' )
models.load_fields('res.company', 'country_id')
models.load_fields('res.company', 'l10n_mx_edi_colony_code')
models.load_fields('res.company', 'l10n_mx_edi_locality')
models.load_fields('res.company', 'city')
models.load_fields('res.company', 'state_id')
models.load_fields('res.company', 'zip')
models.load_fields('res.company', 'country_id')
models.load_fields('account.journal', 'direccion')


var PedidoEspecial = screens.ActionButtonWidget.extend({
    template: 'PedidoEspecial',
    init: function(parent, options) {
        this._super(parent, options);
        this.pos.bind('change:selectedOrder',this.renderElement,this);
    },
    button_click: function(){
        var self = this;
        var order = this.pos.get_order();
        var gui = this.pos.gui;

        order.pedido_especial = !order.pedido_especial;

        var set_especial = this.pos.set_pedidoEspecial(order.pedido_especial);
        var get_especial = this.pos.get_pedidoEspecial();
        this.renderElement();
        var cuotas_lista = {};
        var dicc_productos_especiales = {};
        var cuota = null;
        order.get_orderlines().forEach(function(l){
          if (l.product.to_make_mrp) {

            if (!(l.product.id in dicc_productos_especiales)) {
              dicc_productos_especiales[l.product.id]={
                'nombre_producto':l.product.display_name,
                'cantidad':0,
                'precio_unitario':l.get_unit_price(),
                'precio_unitario_con_iva':l.get_price_with_tax(),
                'precio_total':0,
                'total_con_iva':0,
                'estado': false,
              }
            }

            if (l.product.id in dicc_productos_especiales) {
              dicc_productos_especiales[l.product.id]['cantidad'] += l.quantity;
              dicc_productos_especiales[l.product.id]['precio_total'] = (dicc_productos_especiales[l.product.id]['cantidad'] * dicc_productos_especiales[l.product.id]['precio_unitario']);
              dicc_productos_especiales[l.product.id]['total_con_iva'] = (dicc_productos_especiales[l.product.id]['cantidad'] * dicc_productos_especiales[l.product.id]['precio_unitario_con_iva']);
            }

          }
        });

        order.set_dicc_prod_especiales(dicc_productos_especiales);

        gui.show_popup('selection-cuota',{
          'title': 'Pedidos especiales',
            'list': cuotas_lista, //Lista vacia
            'confirm': function(cuota) {
              var dicc_total = {};
              var stt_prod=0, tt_prod=0, tt_iva=0;
              var fecha = document.getElementById("meeting-time");
              var hora = document.getElementById("field_time");
              var observaciones = document.getElementById("observaciones_id");
              var autorizo = document.getElementById("autorizo_id");
              var sucursal_entrega = document.getElementById("entrega_id");
              var fecha_hora_actual1 = new Date();

              if (autorizo.value == '' || fecha.value=='' || hora.value=='' ) {
                var campo_vacio;

                if (autorizo.value =='') {
                  campo_vacio = ":: El campo autorizo se encuentra vacío ::"
                }
                if (fecha.value =='') {
                  campo_vacio = ":: El campo fecha se encuentra vacío ::"
                }
                if (hora.value =='') {
                  campo_vacio = ":: El campo hora se encuentra vacío ::"
                }

                gui.show_popup('error',{
                    title: campo_vacio,
                    list: [
                        //{ label: 'foobar',  item: 45 },
                        //{ label: 'bar foo', item: 'stuff' },
                    ],
                    confirm: function(cuota) {
                        this.gui.close_popup();
                    },
                });


              }else{
                var fecha_actual1 = fecha_hora_actual1.getDate();
                //var formato_correcto_hoy = fecha_actual1.split('-').reverse().join('/');
                var fecha_hora_correctas = fecha_hora_actual1.getDate()+'/'+(fecha_hora_actual1.getMonth()+1)+'/'+fecha_hora_actual1.getFullYear()+' '+ (fecha_hora_actual1.getHours()+':'+fecha_hora_actual1.getMinutes())
                var fecha_formato_original = fecha.value;
                var formato_correcto = fecha_formato_original.split('-').reverse().join('/');
                document.querySelector('input[type="datetime-local"]');
                order.set_fecha(fecha.value);
                order.set_hora(hora.value);
                var observa = observaciones.value ;
                observa = observa.replace(/ (\n) + / g, '<br></br>')
                order.set_observaciones(observa);
                order.set_autorizo(autorizo.value)
                order.set_entrega(sucursal_entrega.value);
                order.set_fecha_formato(formato_correcto);
                order.set_fecha_hora_actual(fecha_hora_correctas);


                order.get_orderlines().forEach(function(l){
                  if (l.product.id in dicc_productos_especiales && dicc_productos_especiales[l.product.id]['estado'] == false) {
                    stt_prod += dicc_productos_especiales[l.product.id]['precio_total'];
                    tt_prod += dicc_productos_especiales[l.product.id]['total_con_iva'];
                    dicc_productos_especiales[l.product.id]['estado'] = true;
                  }
                });

                tt_iva = (tt_prod - stt_prod);

                dicc_total={
                  'sub_total': stt_prod.toFixed(2),
                  'total_iva': tt_iva.toFixed(2),
                  'total': tt_prod.toFixed(2),
                };
                // order.set_totalString(dicc_total['total']);

                rpc.query({
                  model: 'pos.order',
                  method: 'texto_total',
                  args: [[],order.get_total_with_tax()],
                },{
                  timeout: 5000,
                }).then(function(total){
                  order.set_totalString(total);

                });

                var terminos_condiciones='';
                terminos_condiciones = order.pos.config.terminos_condiciones.toString();
                order.set_terminosCondiciones(terminos_condiciones);
                order.set_dicc_total(dicc_total);

              }

            },

        });

    },

});

screens.define_action_button({
    'name': 'pedidoespecial',
    'widget': PedidoEspecial,
    'condition': function(){
        return this.pos.config.pedido_especial;
    },
});



var SelectionCuotaPopupWidget = PopupWidget.extend({
    template: 'SelectionCuotaPopupWidget',
    show: function(options){
        var self = this;
        options = options || {};
        this._super(options); //Eliminar this.pos...

        this.list = options.list || [];
        this.is_selected = options.is_selected || function (item) { return false; };
        this.renderElement();
    },
    click_item : function(event) {
        if (this.options.confirm) {
            var item = this.list[parseInt($(event.target).data('item-index'))];
            item = item ? item.item : item;
            this.options.confirm.call(self,item);
        }
    }
});
gui.define_popup({name:'selection-cuota', widget: SelectionCuotaPopupWidget});

screens.ReceiptScreenWidget.include({
  render_receipt: function() {
    this.$('.pos-receipt-container-ticket').html(QWeb.render('TicketPedidoEspecial', this.get_receipt_render_env()));
    this._super();
  },
});

var _super_order = models.Order.prototype;

models.Order = models.Order.extend({

  set_fecha: function(fecha_hora){
    this.set({
      fecha: fecha_hora
    });
  },

  get_fecha: function(){
    return this.get('fecha');
  },

  set_hora: function(hora_id){
    this.set({
      hora: hora_id
    });
  },

  get_hora: function(){
    return this.get('hora')
  },

  set_observaciones: function(observaciones){
    this.set({
      observaciones: observaciones
    });
  },

  get_observaciones: function(){
    return this.get('observaciones')
  },

  set_autorizo: function(autorizo){
    this.set({
      autorizo: autorizo
    });
  },

  get_autorizo: function(){
    return this.get('autorizo')
  },

  set_terminosCondiciones: function(terminos_condiciones){
    this.set({
      terminos_condiciones: terminos_condiciones
    });
  },

  get_terminos_condiciones: function(){
    return this.get('terminos_condiciones')
  },

  set_entrega: function(sucursal_entrega){
    this.set({
      entrega: sucursal_entrega
    });
  },

  get_entrega: function(){
    return this.get('entrega')
  },

  set_fecha_formato: function(formato_correcto){
    this.set({
      formato_correcto: formato_correcto
    });
  },

  get_fecha_formato: function(){
    return this.get('formato_correcto')
  },

  set_fecha_hora_actual: function (fecha_hora_actual){
    this.set({
      fecha_hora_actual: fecha_hora_actual
    });
  },

  get_fecha_hora_actual: function(){
    return this.get('fecha_hora_actual')
  },

  set_dicc_prod_especiales: function(dicc_productos_especiales){
    this.set({
      dicc_productos_especiales: dicc_productos_especiales
    });
  },

  get_dicc_prod_especiales: function(){
    return this.get('dicc_productos_especiales')
  },

  set_dicc_total: function(dicc_total){
    this.set({
      dicc_total: dicc_total
    });
  },

  get_dicc_total: function(){
    return this.get('dicc_total')
  },

  export_as_JSON : function(){

    var new_json = _super_order.export_as_JSON.apply(this);
    new_json['fecha'] = this.get_fecha() ? this.get_fecha() : false;
    new_json['hora'] = this.get_hora() ? this.get_hora(): false;
    new_json['observaciones'] = this.get_observaciones() ? this.get_observaciones() : false;
    new_json['sucursal_entrega'] = this.get_entrega() ? this.get_entrega() : false;
    new_json['autorizo'] = this.get_autorizo() ? this.get_autorizo() : false;
    return new_json;
  },

  initialize: function() {
    _super_order.initialize.apply(this,arguments);
    this.set_fecha();
    this.set_hora();
    this.set_observaciones();
    this.set_autorizo();
    this.set_fecha_formato();
    this.set_entrega();
    this.set_fecha_hora_actual();
    this.set_dicc_prod_especiales();
    this.set_dicc_total();
    this.set_terminosCondiciones();
	},

});




});
