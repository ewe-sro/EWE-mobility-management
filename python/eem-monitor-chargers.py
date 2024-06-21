from datetime import datetime, timedelta

import csv
import re
import os

now = datetime.now().strftime('%d-%m-%Y %H:%M:%S')
print(f"[{now}] Script started")



#######################################
############# SET LOGGING #############
#######################################

from utils import set_logging
import logging

set_logging()

###########################################
############# END SET LOGGING #############
###########################################



###############################################
############# CONNECT TO DATABASE #############
###############################################

from utils import set_db

if os.getenv("APP_ENV") == "production":
    db_name = os.getenv("PROD_DB_NAME")
    db_host = os.getenv("PROD_DB_HOST")
    db_port = os.getenv("PROD_DB_PORT")
    db_user = os.getenv("PROD_DB_USER")
    db_pw = os.getenv("PROD_DB_PASSWORD")
else:
    db_name = os.getenv("DEV_DB_NAME")
    db_host = os.getenv("DEV_DB_HOST")
    db_port = os.getenv("DEV_DB_PORT")
    db_user = os.getenv("DEV_DB_USER")
    db_pw = os.getenv("DEV_DB_PASSWORD")

connection, cursor = set_db(db_name, db_host, db_port, db_user, db_pw)

###################################################
############# END CONNECT TO DATABASE #############
###################################################



#######################################################
############# GET LAST KNOWN DEVICE STATE #############
#######################################################
    
def get_last_known_state(device_uid):
    cursor.execute(f"SELECT state FROM last_known_state WHERE controller_id='{device_uid}';")

    if cursor.rowcount > 0:
        result = cursor.fetchone()

        # If the state is valid
        if result["state"] == "connected" or result["state"] == "disconnected":
            return result["state"]
        else:
            return False
        
    else:
        return False

###########################################################
############# END GET LAST KNOWN DEVICE STATE #############
###########################################################



#######################################################
############# SET LAST KNOWN DEVICE STATE #############
#######################################################

def set_last_known_state(device_uid, state):
    # Check if controller with the corresponding device_uid is already in the database
    cursor.execute(f"SELECT state FROM last_known_state WHERE controller_id='{device_uid}';")

    # If the supplied state is valid
    if state == "connected" or state == "disconnected":
        if cursor.rowcount == 0:
            cursor.execute(f"INSERT INTO last_known_state (state, controller_id) VALUES ('{state}', '{device_uid}');")
            connection.commit()

            logging.info(f"Creating last known device state deviceUid: {device_uid}, state: {state}")

        else:
            cursor.execute(f"UPDATE last_known_state SET state = '{state}' WHERE controller_id = '{device_uid}';")
            connection.commit()

            logging.info(f"Setting last known device state controller_id: {device_uid}, state: {state}")

    else:
        logging.error(f"Incorrect device state deviceUid: {device_uid}, state: {state}")

###########################################################
############# END SET LAST KNOWN DEVICE STATE #############
###########################################################


        
############################################
############# CHARGER API CALL #############
############################################
        
import requests
        
def call_charger_api(ip_address, api_port, api_call):
    # Make a REST API call to get the current energy data
    api_url = f"http://{ip_address}:{api_port}/api/v1.0/{api_call}"

    try:
        response = requests.get(api_url)

        # If the API response is successful
        if response.status_code == 200:
            logging.info(f"API call was successful, URL: {api_url}")

            # Parse the response JSON data
            return response.json()

        else:
            logging.error(f"API call failed, URL: {api_url}")

            return False
        
    except:
        logging.error(f"Connection to the charging controller API failed: {api_url}")

        return False

################################################
############# END CHARGER API CALL #############
################################################
    


####################################################
############# ON VEHICLE STATUS CHANGE #############
####################################################

from utils import test_connection

def on_vehicle_status_changed(client, userdata, message):
    logging.info(f"Message received from topic {message.topic}")

    # Get the charger data
    charger_id = userdata["charger_id"]
    charger_ip_address  = userdata["charger_ip_address"]
    charger_mqtt_port = userdata["charger_mqtt_port"]
    charger_rest_api_port = userdata["charger_rest_api_port"]

    # Test the MQTT and REST API connection to the charger
    mqtt_connection = test_connection(charger_ip_address, charger_mqtt_port)
    rest_api_connection = test_connection(charger_ip_address, charger_rest_api_port)

    # Check if controller with the corresponding device_uid is already in the database
    cursor.execute(f"SELECT * FROM connection_status WHERE charger_id='{charger_id}';")

    # If not create a charging controller record
    if cursor.rowcount == 0:
        cursor.execute(f"INSERT INTO connection_status (mqtt_status, rest_api_status, charger_id) VALUES ({mqtt_connection}, {rest_api_connection}, {charger_id});")

        connection.commit()
    else:
        cursor.execute(f"UPDATE connection_status SET mqtt_status = {mqtt_connection}, rest_api_status = {rest_api_connection} WHERE charger_id = {charger_id};")


    vehicle_state = message.payload.decode("utf-8")
    # Vehicle connected states
    connected_vehicle_state = ["B1", "B2", "C1", "C2", "D1", "D2"]
    
    # Define a regular expression pattern to find a device_uid from message topic
    pattern = r"/([^/]+)/"
    # Find device_uid from the message topic
    match = re.search(pattern, message.topic)

    # Extract the device_uid if a match is found
    if match:
        device_uid = match.group(1)


    # Get the charging controller data from API
    controller_url = f"charging-controllers/{device_uid}/info"
    controller_data = call_charger_api(charger_ip_address, charger_rest_api_port, controller_url)

    # Get the charging point data from API
    charging_point_url = "charging-points"
    charging_point_data = call_charger_api(charger_ip_address, charger_rest_api_port, charging_point_url)
    charging_point_name = ""

    # If the API call was successful
    if charging_point_data != False:
        # Loop over the charging points and their data
        for charging_point, data in charging_point_data["charging_points"].items():
           # Check if the device_uid matches current device_uid variable
           if data["charging_controller_device_uid"] == device_uid:
               charging_point_id = data["id"]
               charging_point_name = data["charging_point_name"]

    # Check if controller with the corresponding device_uid is already in the database
    cursor.execute(f"SELECT * FROM charging_controller WHERE id='{device_uid}';")

    # If not create a charging controller record
    if cursor.rowcount == 0:
        try:
            cursor.execute(f"INSERT INTO charging_controller (id, charging_point_id, charging_point_name, parent_device_uid, position, device_name, firmware_version, hardware_version, charger_id) \
                            VALUES ('{device_uid}', {charging_point_id}, '{charging_point_name}', '{controller_data["parent_device_uid"]}', {controller_data["position"]}, '{controller_data["device_name"]}', '{controller_data["firmware_version"]}', '{controller_data["hardware_version"]}', {charger_id});")

            connection.commit()

        except:
            logging.error(f"Unable to add charging controller record to database, charger (ID: {charger_id}) might be deleted")

    # If record already exists update the data
    else:
        cursor.execute(f"UPDATE charging_controller SET charging_point_id={charging_point_id}, charging_point_name='{charging_point_name}', parent_device_uid='{controller_data["parent_device_uid"]}', position={controller_data["position"]}, device_name='{controller_data["device_name"]}', firmware_version='{controller_data["firmware_version"]}', hardware_version='{controller_data["hardware_version"]}' \
                        WHERE id='{device_uid}';")
        connection.commit()

    # Get the starting energy data from API
    energy_url = f"charging-controllers/{device_uid}/data?param_list=energy"
    energy_data = call_charger_api(charger_ip_address, charger_rest_api_port, energy_url)

    # Get the RFID data from API
    rfid_url = f"charging-controllers/{device_uid}/data?param_list=rfid"
    rfid_data = call_charger_api(charger_ip_address, charger_rest_api_port, rfid_url)

    # If vehicle is connected
    if vehicle_state in connected_vehicle_state:
        print(f"[{now}] EV connected! deviceUid: {device_uid}")
        logging.info(f"EV connected to deviceUid: {device_uid}")

        # If the API calls were successful
        if energy_data and rfid_data != False:

            # Get the last known state of the devicex
            last_known_state = get_last_known_state(device_uid)

            # If state doesn't exist or last known state is 'disconnected'
            if last_known_state is False or last_known_state == "disconnected":

                if rfid_data["rfid"]["timestamp"] == "":
                    rfid_timestamp = "NULL"
                else:
                    rfid_timestamp = f"{datetime.fromisoformat(rfid_data["rfid"]["timestamp"])}"

                # Collect all the data from API calls in a dictionary
                data = {
                    "rfidTag": rfid_data["rfid"]["tag"],
                    "rfidTimestamp": rfid_timestamp,
                    "startRealPower": energy_data["energy"]["energy_real_power"]["value"],
                    "startTimestamp": datetime.fromisoformat(energy_data["energy"]["timestamp"]),
                }

                # Get the time difference between RFID timestamp and start timestamp of the charging session
                if rfid_timestamp != "NULL":
                    rfid_difference = abs(data["rfidTimestamp"] - data["startTimestamp"])

                    # Check if RFID timestamp is within 60 seconds of the start of the charging session
                    if rfid_difference >= timedelta(seconds=60):
                        rfid_timestamp = "NULL"

                # Check if controller with the corresponding device_uid is already in the database
                cursor.execute(f"SELECT * FROM charging_controller WHERE id='{device_uid}';")

                # If not create a charging controller record
                if cursor.rowcount != 0:
                    # Write the charging data to the database
                    cursor.execute(f"INSERT INTO charging_session (start_real_power, start_timestamp, rfid_tag, rfid_timestamp, controller_id) VALUES ({data['startRealPower']}, '{data['startTimestamp']}', '{data['rfidTag']}', {data["rfidTimestamp"]}, '{device_uid}');")
                    connection.commit()

                    logging.info(f"Data was successfully added to the database")

                    # Set the last known state to 'connected'
                    set_last_known_state(device_uid, "connected")

                else:
                    logging.error(f"Charging controller not found deviceUid: {device_uid}")

        else:
            logging.error(f"API calls were unsuccessful, exiting deviceUid: {device_uid}")

    # If vehicle is NOT connected
    else:
        print(f"[{now}] EV disconnected! deviceUid: {device_uid}")
        logging.info(f"EV disconnected from deviceUid: {device_uid}")

        # If the API calls were successful
        if energy_data and rfid_data != False:
            # Get the last known state of the device
            last_known_state = get_last_known_state(device_uid)

            if last_known_state == "connected":
                # Get the start real power from databaase
                cursor.execute(f"SELECT start_real_power, start_timestamp FROM charging_session WHERE controller_id='{device_uid}' AND end_real_power IS NULL;")
                
                # If no open charging session was found
                if cursor.rowcount == 0:
                    logging.error(f"No open charging sessions were found deviceUid: {device_uid}")

                else:
                    result = cursor.fetchone()

                    start_timestamp = result["start_timestamp"]
                    start_real_power = result['start_real_power']
                    duration = datetime.strptime(energy_data["energy"]["timestamp"], "%Y-%m-%dT%H:%M:%S") - start_timestamp # convert timestamp to datetime object
                    
                    data = {
                        "endRealPower": energy_data["energy"]["energy_real_power"]["value"],
                        "consumption": energy_data["energy"]["energy_real_power"]["value"] - start_real_power,
                        "endTimestamp": energy_data["energy"]["timestamp"],
                        "duration": duration.total_seconds()
                    }

                    cursor.execute(f"UPDATE charging_session SET end_real_power={data['endRealPower']}, consumption={data['consumption']}, end_timestamp='{data['endTimestamp']}', duration={data['duration']} WHERE controller_id='{device_uid}' AND end_real_power IS NULL;")
                    connection.commit()

                    logging.info(f"Charging data was successfully added to the database")

        else:
            logging.error(f"API calls were unsuccessful, exiting deviceUid: {device_uid}")

        set_last_known_state(device_uid, "disconnected")

########################################################
############# END ON VEHICLE STATUS CHANGE #############
########################################################



###########################################
############# MQTT CONNECTION #############
###########################################

import paho.mqtt.client as mqtt

# Topic to find out if vehicle is connected
topic = "charging_controllers/+/data/iec_61851_state"

# Callback when the client connects to the broker
def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        logging.info(f"Connected to MQTT broker")
        client.subscribe(topic)
        logging.info(f"Subscribed to topic: {topic}")
    else:
        logging.error(f"Failed to connect to MQTT broker with reason code {reason_code}")

###############################################
############# END MQTT CONNECTION #############
###############################################

import time

# Get all charger data from database
cursor.execute("SELECT * FROM charger;")
chargers = cursor.fetchall()

# Create a list of MQTT client connections
clients = []

for charger in chargers:
    # Get the charger data from database and save it to userdata variable
    userdata = {
        "charger_id": charger["id"],
        "charger_ip_address": charger["ip_address"],
        "charger_mqtt_port": charger["mqtt_port"],
        "charger_rest_api_port": charger["rest_api_port"]
    }

    # Create an MQTT client instance
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, userdata=userdata)

    # Set up callbacks
    client.on_connect = on_connect
    client.message_callback_add(topic, on_vehicle_status_changed)

    try:
        # Connect to the broker
        client.connect(userdata["charger_ip_address"], userdata["charger_mqtt_port"])

        # Start the MQTT loop to handle incoming messages
        client.loop_start()

        # Add the connection to the list
        clients.append([userdata["charger_id"] ,client])

    except:
        logging.error(f"Failed to connect to MQTT broker: {userdata["charger_ip_address"]}")

# Keep the script running
try:
    while True:
        # Get all chargers from database
        cursor.execute("SELECT * FROM charger;")
        chargers = cursor.fetchall()

        # Search for changes
        for charger in chargers:
            # If charger record is in database but not in clients list
            exists = any(charger["id"] in sl for sl in clients)

            if exists == False:
                # Get the charger data from database and save it to userdata variable
                userdata = {
                    "charger_id": charger["id"],
                    "charger_ip_address": charger["ip_address"],
                    "charger_mqtt_port": charger["mqtt_port"],
                    "charger_rest_api_port": charger["rest_api_port"]
                }

                # Create an MQTT client instance
                client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, userdata=userdata)

                # Set up callbacks
                client.on_connect = on_connect
                client.message_callback_add(topic, on_vehicle_status_changed)

                try:
                    # Connect to the broker
                    client.connect(userdata["charger_ip_address"], userdata["charger_mqtt_port"])

                    # Start the MQTT loop to handle incoming messages
                    client.loop_start()

                    # Add the connection to the list
                    clients.append([userdata["charger_id"], client])

                    logging.info(f"Charger not connected, adding charger to list of MQTT clients: {userdata["charger_id"]}")

                except:
                    logging.error(f"Failed to connect to MQTT broker: {userdata["charger_ip_address"]}")

        for client in clients:
            # Check if the client is in database
            cursor.execute(f"SELECT id FROM charger WHERE id = {client[0]};")

            # If charger is not in the database anymore
            if cursor.rowcount == 0:
                # Disconnect the client and the remove it from the clients list
                client[1].disconnect()
                client[1].loop_stop()

                clients.remove(client)

                logging.info(f"Charger not connected, adding charger to list of MQTT clients: {userdata["charger_id"]}")

        time.sleep(10)

except KeyboardInterrupt:
    logging.info("Script terminated by user")

    # Close all the MQTT connections
    for client in clients:
        client[1].disconnect()
        client[1].loop_stop()

    # Close the DB connection
    cursor.close()
    connection.close()