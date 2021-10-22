# -*- coding: utf-8 -*-
{
    'name': "Boton Quemen",

    'summary': """ Desarrollo boton pedido especial """,

    'description': """
        Desarrollo extra pra quemen
    """,

    'author': "JS",
    'website': "",

    'category': 'Uncategorized',
    'version': '0.1',

    'depends': ['stock','base','point_of_sale','hr_payroll', 'pos_ticket_mx', 'pos_mrp_order'],

    'data': [
        'views/pos_config_extra_views.xml',
        'views/templates.xml',
        'views/pos_order_extra_views.xml',
        'views/account_journal_extra_views.xml',
    ],
    'qweb': [
        'static/src/xml/pos.xml',
        'static/src/xml/pos_ticket_pedido_especial.xml'
    ],
}
