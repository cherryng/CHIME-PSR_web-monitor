# Connect to the web server
- Start the tunnel using `ssh -NL 5000:psr-archiver.chime:5000 [user]@tubular.chimenet.ca`
- on a web browser, go to http://localhost:5000

# Launch the backend (if not running already)
On `psr-archiver`:

### Start the web server (on a screen)
`python /home/chitrang/Pulsar-Monitor-Web/chan_18c/psr_server.py`

### Make thumbnails plot (on a screen)
`./Thumbnail-plots/MakePlots.csh`
