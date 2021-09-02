import requests
import json
import numpy as np

# east =   2.570290
# west = -14.931820
# north = 62.310835
# south = 48.519515


east = 180;
west = -180;
north = 90;
south = -90

samples_lat = 50
samples_lon = 50

elevation_api_limit = 400
nb_groups = 1 + samples_lat * samples_lon // elevation_api_limit


lons = np.linspace(west, east, samples_lat)
lats = np.linspace(north, south, samples_lon)

samples = np.array([])

for lat in lats:
    for lon in lons:
        samples = np.append(samples, {"latitude": lat, "longitude": lon})

sample_groups = np.array_split(samples, nb_groups)


response_points = []
for group in sample_groups:
    post_payload = {"locations": group.tolist()}
    response = requests.post(
        "https://api.open-elevation.com/api/v1/lookup",
        json=post_payload
    )
    if response.status_code != 200:
        raise Exception("Status code {} received" % response.status_code)
    else:
        response_object = json.loads(response.text)
        response_points += response_object["results"]


print(json.dumps({
    "response": response_points,
    "nLat": samples_lat,
    "nLon": samples_lon
}))
