odoo.define('pos_pedido_especial.models', function (require) {
"use strict";
var rpc = require('web.rpc');
var models = require('point_of_sale.models');
var gui = require('point_of_sale.gui');
var time, time1 = require('web.time');
var field_utils = require('web.field_utils');


var _super_posmodel = models.PosModel.prototype;

models.PosModel = models.PosModel.extend({

  add_new_order: function(){
      var new_order = _super_posmodel.add_new_order.apply(this);
      this.set('pedido_especial', false);
    },

    set_pedidoEspecial: function(pedido_especial){
      this.set('pedido_especial', pedido_especial);
    },

    get_pedidoEspecial: function(){
      return this.get('pedido_especial');
    },

})

var _super_order = models.Order.prototype;

var _super_order_line = models.Orderline.prototype;

models.Order = models.Order.extend({
  export_as_JSON : function(){
    var new_json = _super_order.export_as_JSON.apply(this);
    new_json['pedido_especial'] = this.pos.get_pedidoEspecial() ? this.pos.get_pedidoEspecial() : false;

    return new_json;
  },
	initialize: function() {
			_super_order.initialize.apply(this,arguments);
			// this.set_diccionarioProductos({});
			// this.get_diccionarioProductos();
			// this.set_descuento(0);
			// this.descuento=0;
	},


})





});
