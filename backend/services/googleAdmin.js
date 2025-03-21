const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const NodeCache = require('node-cache');

// Cache for storing device information (30 minutes TTL)
const deviceCache = new NodeCache({ stdTTL: 1800 });

class GoogleAdminService {
    constructor() {
        this.auth = null;
        this.adminSDK = null;
        this.customerId = null;
    }

    async initialize(credentials) {
        try {
            console.log('Initializing Google Admin Service...');
            const { client_email, private_key } = credentials;
            
            console.log('Setting up JWT authentication with:', { client_email });
            this.auth = new JWT({
                email: client_email,
                key: private_key,
                scopes: [
                    'https://www.googleapis.com/auth/admin.directory.device.chromeos',
                    'https://www.googleapis.com/auth/admin.directory.orgunit',
                    'https://www.googleapis.com/auth/admin.directory.user'
                ],
                subject: process.env.GOOGLE_ADMIN_EMAIL
            });

            console.log('Creating Admin SDK instance...');
            this.adminSDK = google.admin({
                version: 'directory_v1',
                auth: this.auth
            });

            // Get the customer ID for the domain
            await this.initializeCustomerId();
            console.log('Google Admin Service initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Google Admin Service:', error);
            throw error;
        }
    }

    async initializeCustomerId() {
        try {
            console.log('Fetching customer ID...');
            const response = await this.adminSDK.customers.get({
                customerKey: 'my_customer'
            });
            this.customerId = response.data.id;
            console.log('Customer ID initialized:', this.customerId);
        } catch (error) {
            console.error('Error fetching customer ID:', error);
            // Fall back to domain-based customer ID
            const domain = process.env.GOOGLE_ADMIN_EMAIL.split('@')[1];
            this.customerId = `C${domain}`;
            console.log('Using domain-based customer ID:', this.customerId);
        }
    }

    async getDevicesFromOU(organizationalUnit) {
        const cacheKey = `devices_${organizationalUnit}`;
        const cachedDevices = deviceCache.get(cacheKey);
        
        if (cachedDevices) {
            console.log(`Returning ${cachedDevices.length} cached devices for OU:`, organizationalUnit);
            return cachedDevices;
        }

        try {
            console.log('Fetching devices from OU:', organizationalUnit);
            const response = await this.adminSDK.chromeosdevices.list({
                customerId: this.customerId,
                orgUnitPath: organizationalUnit,
                projection: 'FULL',
                maxResults: 100 // Adjust this based on your needs
            });

            if (!response.data.chromeosdevices) {
                console.log('No devices found in OU:', organizationalUnit);
                return [];
            }

            const devices = response.data.chromeosdevices.map(device => ({
                deviceId: device.deviceId,
                serialNumber: device.serialNumber,
                status: device.status,
                lastSync: device.lastSync,
                macAddress: device.macAddress,
                annotatedUser: device.annotatedUser,
                orgUnitPath: device.orgUnitPath,
                model: device.model,
                osVersion: device.osVersion,
                bootMode: device.bootMode
            }));

            console.log(`Found ${devices.length} devices in OU:`, organizationalUnit);
            deviceCache.set(cacheKey, devices);
            return devices;
        } catch (error) {
            console.error('Error fetching Chrome devices:', error);
            throw error;
        }
    }

    async getDeviceDetails(deviceId) {
        const cacheKey = `device_${deviceId}`;
        const cachedDevice = deviceCache.get(cacheKey);

        if (cachedDevice) {
            console.log('Returning cached device details for:', deviceId);
            return cachedDevice;
        }

        try {
            console.log('Fetching device details for:', deviceId);
            const response = await this.adminSDK.chromeosdevices.get({
                customerId: this.customerId,
                deviceId: deviceId
            });

            const deviceDetails = {
                deviceId: response.data.deviceId,
                serialNumber: response.data.serialNumber,
                status: response.data.status,
                lastSync: response.data.lastSync,
                annotatedUser: response.data.annotatedUser,
                orgUnitPath: response.data.orgUnitPath,
                macAddress: response.data.macAddress,
                model: response.data.model,
                osVersion: response.data.osVersion,
                bootMode: response.data.bootMode
            };

            console.log('Device details retrieved successfully for:', deviceId);
            deviceCache.set(cacheKey, deviceDetails);
            return deviceDetails;
        } catch (error) {
            console.error('Error fetching device details:', error, 'for device:', deviceId);
            throw error;
        }
    }

    async matchDeviceToStudent(macAddress) {
        console.log('Matching device for MAC address:', macAddress);
        try {
            const devices = await this.getDevicesFromOU(process.env.ORG_UNIT_PATH);
            const match = devices.find(device => device.macAddress === macAddress);
            if (match) {
                console.log('Found matching device:', match);
            } else {
                console.log('No matching device found for MAC:', macAddress);
            }
            return match;
        } catch (error) {
            console.error('Error matching device:', error);
            return null;
        }
    }

    clearCache() {
        console.log('Clearing device cache');
        deviceCache.flushAll();
    }
}

module.exports = new GoogleAdminService();
