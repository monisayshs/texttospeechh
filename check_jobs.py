import requests

for jid in ["2cad150cac6b388bc083bcb5", "d7873d069cd500bdb7cff76c"]:
    res = requests.get(f"http://localhost:3000/api/status?jobId={jid}")
    data = res.json()
    print(f"Job {jid}: State={data.get('state')}, Chunks={data.get('processedChunks')}/{data.get('totalChunks')}, Progress={data.get('progress')}%, AudioSize={data.get('audioSize')} bytes")
    
    dl = requests.get(f"http://localhost:3000/api/status?jobId={jid}&download=true")
    print(f"Download HTTP Status: {dl.status_code}, Disposition: {dl.headers.get('Content-Disposition')}, Merged MP3 Size: {len(dl.content)} bytes\n")
