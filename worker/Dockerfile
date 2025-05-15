# expected to have the parent directory as context

FROM python:3.11

WORKDIR /app

RUN set -x \
    && apt-get update \
    && apt-get install -y \
      software-properties-common \
      npm

RUN npm install n -g && n 21

ADD database/requirements.txt database/requirements.txt
ADD database/fair_assessment/requirements.txt database/fair_assessment/requirements.txt
RUN set -x \
&& python -m pip install --break-system-packages \
-r database/requirements.txt \
-r database/fair_assessment/requirements.txt

ADD database/*.py database/
ADD database/fair_assessment/ database/fair_assessment/
ADD drc-portals/ drc-portals/
WORKDIR /app/drc-portals
RUN npm i

ENV PYTHON_BIN=python
ENV DATABASE_URL ""
CMD ["npm", "run", "worker"]
