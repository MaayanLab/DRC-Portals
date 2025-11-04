FROM python:3.10-alpine
WORKDIR /work

ENV CRYPTOGRAPHY_DONT_BUILD_RUST=1
RUN apk add --no-cache \
  bash \
  curl \
  tmux \
  git \
  postgresql-client \
  gcc \
  libc-dev \
  linux-headers \
  jpeg-dev zlib-dev mariadb-dev libffi-dev openblas-dev libgfortran lapack-dev build-base openssl-dev \
  hdf5-dev

ADD requirements.txt requirements.txt
ADD fair_assessment/requirements.txt fair_assessment_requirements.txt
RUN pip install -r requirements.txt -r fair_assessment_requirements.txt
ADD . .
RUN mkdir -p ingest
CMD ["/bin/sh"]