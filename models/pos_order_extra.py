# -*- coding: utf-8 -*-
from odoo import api, fields, models, SUPERUSER_ID, _
from odoo.exceptions import UserError
import logging
import pytz

class PosInfoExtra(models.Model):
    _inherit = 'pos.order'

    fecha_especial = fields.Date(string="Fecha entrega: ")
    hora_especial = fields.Char(string="Hora entrega");
    observaciones_especial = fields.Char(string="Observaciones:  ")
    sucursal_entrega = fields.Char("Sucursal de entrega: ")
    autorizo_especial = fields.Char(string="Autorizó: ")
