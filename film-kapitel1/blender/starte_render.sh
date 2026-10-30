#!/bin/bash
cd "$(dirname "$0")"; setsid nohup ../bvenv/bin/python render_schleife.py >> render_schleife.txt 2>&1 < /dev/null & disown
