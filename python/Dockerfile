FROM python:3.12-slim as build

# Get Linux updates nad install needed packages
RUN apt-get update && \
    apt-get -y install libpq-dev gcc

ENV TZ="Europe/Prague"

# Set up the development environment
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -U pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the application files
COPY eem-monitor-chargers.py utils.py ./

CMD [ "python", "./eem-monitor-chargers.py" ]