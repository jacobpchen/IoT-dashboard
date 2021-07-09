import authenticationInstance from '../Authentication';
import * as needle from 'needle';

needle.defaults({
    open_timeout: 31000,
});

export const Service = {
    collectFroniousData: async (from, to, aggregationType, locationIds) => {
        const invertersRequestUrl = Service.getCarPortsDataURI(from, to, aggregationType, locationIds);
        const response = await needle('get', invertersRequestUrl, await Service.getAuthHeaders());
        let carPortData = [];
        if (response.statusCode === 200) {
            carPortData = response.body.data;
        }
        else if(response.statusCode === 403){
            throw new Error("Forbidden");
        } else {
            throw new Error("Timeout");
        }
        return carPortData;
    },

    getUserVisibleCarPorts: async () => {
        const carPortsRequestUrl = Service.getCarPortsURI();
        const response = await needle('get', carPortsRequestUrl, await Service.getAuthHeaders());
        let carports = [];
        if (response.statusCode === 200) {
            carports = response.body.carPorts;
        } else {
            console.log(response.statusCode);
            throw new Error("Failed to get carports");
        }
        return carports;
    },

    getAuthHeaders: async () => {
        return {
            headers: {
                "Authorization": await authenticationInstance.getBearerAuthHeader()
            }
        };
    },

    getAssignableLocations: async () => {
        const requestUrl = Service.getAssignableLocationURI();
        const response = await needle('get', requestUrl, await Service.getAuthHeaders());
        let locationData = {};
        if(response.statusCode === 200){
            //fill locationData
            locationData = response.body;
        }
        return locationData
    },
    getUsers: async () => {
        const requestUrl = Service.getUsersURI();
        const response = await needle('get', requestUrl, await Service.getAuthHeaders());
        let users = [];
        if(response.statusCode === 200){
            users = response.body.users;
        }
        return users;
    },
    addUserToLocation: async (userId, locationId) => {
        const requestUrl = Service.addUserToLocationURI(userId, locationId);
        const response = await needle('get', requestUrl, await Service.getAuthHeaders());
        if(response.statusCode === 200){
            return true;
        }
        return false;
    },
    removeUserFromLocation: async (userId, locationId) => {
        const requestUrl = Service.removeUserFromLocationURI(userId, locationId);
        const response = await needle('get', requestUrl, await Service.getAuthHeaders());
        if(response.statusCode === 200){
            return true;
        }
        return false;
    },

    getCarPortsDataURI: (startTS, endTS, aggregation, locationIds) => {
        const locationIdsCommaSeparated = locationIds.join();
        return `https://data.isun.pixida.com/frontend/v1/handler?fromTimestampMs=${startTS}&toTimestampMs=${endTS}&aggregationType=${aggregation}&action=getCarPortsData&locationIds=${locationIdsCommaSeparated}`;
    },
    getCarPortsURI: () => {
        return `https://data.isun.pixida.com/frontend/v1/handler?action=getCarPorts`;
    },
    getAssignableLocationURI: () => {
        return `https://data.isun.pixida.com/frontend/v1/handler?action=getAssignableLocations`;
    },
    getUsersURI: () => {
        return `https://data.isun.pixida.com/frontend/v1/handler?action=getUsers`
    },
    addUserToLocationURI: (userId, locationId) =>{
        return `https://data.isun.pixida.com/frontend/v1/handler?action=addUserToLocation&locationId=${locationId}&userId=${userId}`
    },
    removeUserFromLocationURI: (userId, locationId) =>{
        return `https://data.isun.pixida.com/frontend/v1/handler?action=removeUserFromLocation&locationId=${locationId}&userId=${userId}`
    },
};



