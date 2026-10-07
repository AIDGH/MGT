#!/usr/bin/env python3
"""Run once as root on the existing Ubuntu MGT server. Never emits credentials."""
import os, pathlib, secrets, subprocess

def run(args, **kwargs):
    return subprocess.run(args, check=True, **kwargs)
if os.geteuid() != 0:
    raise SystemExit('Run as root')
if subprocess.run(['id', '-u', 'mgt'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode:
    run(['useradd', '--system', '--home-dir', '/var/lib/mgt', '--create-home', '--shell', '/usr/sbin/nologin', 'mgt'])
for path, mode in [('/etc/mgt',0o700),('/var/lib/mgt/uploads',0o755),('/var/backups/mgt',0o700),('/opt/mgt/releases',0o755)]:
    pathlib.Path(path).mkdir(parents=True,exist_ok=True)
    os.chmod(path,mode)
run(['chown','-R','mgt:mgt','/var/lib/mgt'])
envfile=pathlib.Path('/etc/mgt/api.env')
if not envfile.exists():
    password=secrets.token_hex(32)
    role=run(['runuser','-u','postgres','--','psql','-Atc',"SELECT 1 FROM pg_roles WHERE rolname='mgtapp'"],capture_output=True,text=True).stdout.strip()
    if role:
        raise SystemExit('Existing mgtapp role without environment; inspect manually, do not reset.')
    run(['runuser','-u','postgres','--','psql','-v','ON_ERROR_STOP=1'],input=f"CREATE ROLE mgtapp LOGIN PASSWORD '{password}';\nCREATE DATABASE mgt OWNER mgtapp;\n",text=True,stdout=subprocess.DEVNULL)
    fd=os.open(envfile,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    with os.fdopen(fd,'w') as f:
        f.write(f'DATABASE_URL=postgresql://mgtapp:{password}@127.0.0.1:5432/mgt\nNODE_ENV=production\nPORT=4001\nAPP_ORIGINS=https://majdglobaltrading.com,https://www.majdglobaltrading.com\nUPLOAD_DIR=/var/lib/mgt/uploads\n')
print('Service account, private database and persistent media directory ready.')
