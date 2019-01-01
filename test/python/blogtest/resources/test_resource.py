from __future__ import absolute_import


def test_format_date():
    from datetime import date

    t = date(2018, 1, 1)
    from blog.resources import format_date
    result = format_date(t)
    assert result == '01-01-2018'
