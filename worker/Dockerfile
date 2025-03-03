# expected to have the parent directory as context

FROM node:21

WORKDIR /app

RUN set -x \
  && apt-get update \
  && apt-get install -y \
    python3 \
    python3-pip

ADD database/ database/
RUN set -x \
  && pip install --break-system-packages \
    -r database/requirements.txt \
    -r database/fair_assessment/requirements.txt

ADD drc-portals/ drc-portals/
WORKDIR /app/drc-portals
RUN npm i

ENV PYTHON_BIN=python3
ENV DATABASE_URL ""
CMD ["npm", "run", "worker"]
