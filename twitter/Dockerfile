FROM python:3
WORKDIR /app
ADD requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt
ADD async_helpers.py /app/async_helpers.py
ADD app.py /app/app.py
CMD ["python", "/app/app.py"]