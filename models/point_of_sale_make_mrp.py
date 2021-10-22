import logging
from odoo import models, fields, api
from odoo.exceptions import Warning


class MrpProduction(models.Model):
    _inherit = 'mrp.production'

    def create_mrp_from_pos(self, products):
        product_ids = []
        pos_reference = False;
        if products:
            for product in products:
                flag = 1
                if product_ids:
                    for product_id in product_ids:
                        pos_reference = product_id['pos_reference']
                        if product_id['id'] == product['id']:
                            product_id['qty'] += product['qty']
                            flag = 0
                if flag:
                    product_ids.append(product)
        pedido_encontrado = self.env['pos.order'].search([('pos_reference', '=', pos_reference)])
        if pedido_encontrado:
            if pedido_encontrado.fecha_especial and pedido_encontrado.hora_especial and pedido_encontrado.autorizo_especial:
                return super(MrpProduction).create_mrp_from_pos(products)
