import requests
import json
import numpy as np
import sys
import argparse


parser = argparse.ArgumentParser(description='Create a grid of lat/lon/elevations')
parser.add_argument('samples_lat', metavar='<Samples-Lat>', type=int, help='Number of samples along latitude')
parser.add_argument('samples_lon', metavar='<Samples-Lon>', type=int, help='Number of samples along longitude')
parser.add_argument('output_file', metavar='<Output-filename>', type=argparse.FileType('w'), help='Output filename')
args = parser.parse_args()

output_file = args.output_file
samples_lat = args.samples_lat
samples_lon = args.samples_lon


# east =   2.570290
# west = -14.931820
# north = 62.310835
# south = 48.519515


east = 180;
west = -180;
north = 90;
south = -90

elevation_api_limit = 400
nb_groups = 1 + samples_lat * samples_lon // elevation_api_limit


lons = np.linspace(west, east, samples_lat)
lats = np.linspace(north, south, samples_lon)

samples = np.array([])

for lat in lats:
    for lon in lons:
        samples = np.append(samples, {"latitude": lat, "longitude": lon})

sample_groups = np.array_split(samples, nb_groups)

print("We're going to fetch {} elevations from the server using {} http calls".format(len(samples), len(sample_groups)))

response_points = []
for i, group in enumerate(sample_groups):
    locations = group.tolist()
    post_payload = {"locations": locations}
    print("Requesting {} elevations ({}/{})".format(
        len(locations), i+1, len(sample_groups)))
    response = requests.post(
        "https://api.open-elevation.com/api/v1/lookup",
        json=post_payload
    )
    if response.status_code != 200:
        raise Exception("Status code {} received" % response.status_code)
    else:
        response_object = json.loads(response.text)
        response_points += response_object["results"]

print("Writing output to " + output_file.name)
#output_file = open(output_filename, "w")
output_file.write(json.dumps({
    "response": response_points,
    "nLat": samples_lat,
    "nLon": samples_lon
}))
output_file.close()
print("done.")
