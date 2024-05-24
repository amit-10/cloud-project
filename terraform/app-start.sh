echo "fixing path"
export PATH=$PATH:/root/.nvm/versions/node/v20.13.0/bin
cd /opt/cloud-project-colman/backend/ && . /root.envs.sh && nohup npm start &
cd /opt/cloud-project-colman/frontend/user-registration-app/ && nohup serve -s build &