import io
import pandas as pd
from django.http import HttpResponse


def queryset_to_excel(qs, columns, file_name):
    """
    qs        – QuerySet
    columns   – OrderedDict { "field": "Заголовок столбца" }
    file_name – имя скачиваемого файла
    """
    df = pd.DataFrame(list(qs.values(*columns.keys())))
    df.rename(columns=columns, inplace=True)

    buf = io.BytesIO()
    df.to_excel(buf, index=False)
    buf.seek(0)

    resp = HttpResponse(
        buf,
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    resp["Content-Disposition"] = f'attachment; filename="{file_name}"'
    return resp
