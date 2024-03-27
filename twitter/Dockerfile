FROM python:3
WORKDIR /app
ADD requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt
ADD app.py /app/app.py
CMD ["python", "/app/app.py"]