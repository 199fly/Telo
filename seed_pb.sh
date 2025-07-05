#!/bin/bash

# PocketBase seeding script
pbcli record create users --data '{"email": "admin@telo.app", "password": "TeloAdmin123", "emailVisibility": true}'
