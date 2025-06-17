from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta  # удобнее для месяцев и лет

def calculate_expiration_date(type_subscription: str) -> datetime.date:
    today = datetime.now().date()
    if type_subscription == "Разовый":
        return today  # срок истекает в тот же день
    elif type_subscription == "Месячный":
        return today + relativedelta(months=1)
    elif type_subscription == "Годовой":
        return today + relativedelta(years=1)
    else:
        raise ValueError("Unknown subscription type")