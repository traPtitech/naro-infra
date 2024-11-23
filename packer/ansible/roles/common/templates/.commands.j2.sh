attach() {	
    name=$1	
    if [ "${name:0:1}" = "r" ]; then	
        docker exec -it --user 1002 $name /bin/vbash	
    else	
        docker exec -it $name /bin/bash	
    fi	
}

add_nic() {
    ovs-docker add-port $1 eth$3 $2 2> /dev/null
    if [ $? != 0 ]; then
        add_nic $1 $2 $(($3+1))
    fi
}

connect() {    
    cn1=$1
    cn2=$2    
    ovs-vsctl add-br br-$1-$2 2> /dev/null
    add_nic br-$1-$2 $1 10      
    add_nic br-$1-$2 $2 10  
}

disconnect() {
    ovs-vsctl del-br br-$1-$2 2> /dev/null
    reset_nic $1
}

reset_nic() {    
    ovs-docker del-ports dummy $1 2> /dev/null
}

add_server() {
    router_name=$1
    container_name=$2
    ovs-vsctl add-br br-$router_name-server
    ovs-docker add-port br-$router_name-server eth100 $router_name
    docker start $container_name || docker run -d --restart always --name $container_name --hostname=$container_name --net=none --privileged {{images.server}} /bin/sh -c "while :; do sleep 1000; done"
    ovs-docker add-port br-$router_name-server ens4 $container_name 
}


reset_server() {
    router_name=$1
    container_name=$2
    ovs-docker del-port br-$router_name-server eth100 $container_name 2> /dev/null
}

server_full_reset() {
    reset_server r4 s1
    reset_server r4 s2
    reset_server r4 s3
    reset_server rEX sEX
    ovs-vsctl del-br br-r4-server 2> /dev/null
    ovs-vsctl del-br br-rEX-server 2> /dev/null

    add_server r4 s1 
    add_server r4 s2 
    add_server r4 s3 
    add_server rEX sEX
}

nic_full_reset() {
    docker start $(docker ps -qa)
    
    seq 1 6 | xargs -I XXX docker exec rXXX bash -c "echo '127.0.0.1 rXXX' >> /etc/hosts"
    docker exec rEX bash -c "echo '127.0.0.1 rEX' >> /etc/hosts"
    docker exec ns bash -c "echo '127.0.0.1 ns' >> /etc/hosts"
    
    reset_nic r1
    reset_nic r2
    reset_nic r3
    reset_nic r4
    reset_nic r5
    reset_nic r6
    reset_nic rEX
    reset_nic ns    

    disconnect r1 r6
    disconnect r1 r2
    disconnect r2 r3
    disconnect r2 r5
    disconnect r3 r4
    disconnect r4 r5
    disconnect r5 r6
    disconnect r1 rEX
    disconnect r6 rEX
    disconnect r4 ns

    reset_nic br-r4-server
    reset_nic br-rEX-server

    connect r1 r6
    connect r1 r2
    connect r2 r3
    connect r2 r5
    connect r3 r4
    connect r4 r5
    connect r5 r6
    connect r1 rEX
    connect r6 rEX
    connect r4 ns
    
    add_nic br-r4-server r4 100
    add_nic br-rEX-server rEX 100
}

full_reset() {
    docker ps -qa | xargs docker rm -f
    docker network prune

    seq 1 6 | xargs -IXXX docker run -d --restart always --name rXXX --hostname=rXXX --net=none --privileged -v /lib/modules:/lib/modules -v rXXX:/opt/vyatta {{images.vyos}} /sbin/init
    docker run -d --restart always --name rEX --hostname=rEX --net=host --privileged -v /lib/modules:/lib/modules -v rXXX:/opt/vyatta {{images.vyos}} /sbin/init
    docker run -d --restart always --name ns --hostname=ns --net=host --privileged -v named:/etc/bind -v lib_bind:/var/lib/bind -v cache_bind:/var/cache/bind {{images.ns}}

    nic_full_reset
    server_full_reset
}
