# -*- coding: utf-8 -*-
from odoo import api, fields, models, SUPERUSER_ID, _
from odoo.exceptions import UserError
import logging
import pytz


class AccountJournal(models.Model):
    _inherit = 'account.journal'

    direccion = fields.Char("Direccion tienda: ")
