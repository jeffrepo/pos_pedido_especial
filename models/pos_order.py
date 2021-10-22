# -*- coding: utf-8 -*-
from odoo import api, fields, models, SUPERUSER_ID, _
from odoo import tools, _
from odoo.exceptions import UserError
from datetime import timedelta, datetime
import logging
import pytz, time
import base64
import psycopg2

class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.model
    def _order_fields(self, ui_order):
        res = super(PosOrder, self)._order_fields(ui_order)
        session = self.env['pos.session'].search([('id', '=', res['session_id'])], limit=1)

        if session.config_id.pedido_especial:
            mal_formato = ui_order['fecha']

            res['hora_especial'] = ui_order['hora']
            res['fecha_especial'] = ui_order['fecha']
            res['observaciones_especial']= ui_order['observaciones']
            res['sucursal_entrega'] = ui_order['sucursal_entrega']
            res['autorizo_especial']=ui_order['autorizo']

        return res
