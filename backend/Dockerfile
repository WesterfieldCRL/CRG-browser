
FROM python:3.9


WORKDIR /code


COPY ./requirements.txt /code/requirements.txt
COPY ./Enh_Prom_Location_Data.csv /code/Enh_Prom_Location_Data.csv


RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt


COPY ./app /code/app


CMD ["fastapi", "run", "app/main.py", "--port", "8000"]