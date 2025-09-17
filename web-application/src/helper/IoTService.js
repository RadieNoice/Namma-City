import supabase from './supabaseClient';

class IoTService {
  static async handleIoTReport(data) {
    try {
      // Validate incoming IoT data
      if (!data.location || !data.category) {
        throw new Error('Invalid IoT report data');
      }

      // Create a new issue from IoT data
      const { data: issue, error } = await supabase
        .from('issues')
        .insert([{
          title: `${data.category} Issue Report`,
          description: `Automatic report from IoT device: ${data.category} issue detected`,
          location: data.location,
          category: data.category,
          status: 'pending',
          source: 'iot',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return issue;
    } catch (error) {
      console.error('Error handling IoT report:', error);
      throw error;
    }
  }

  static async verifyDevice(deviceId, token) {
    // Implement device verification logic here
    // This would typically check against a database of registered IoT devices
    try {
      const { data: device, error } = await supabase
        .from('iot_devices')
        .select('*')
        .eq('device_id', deviceId)
        .single();

      if (error) throw error;
      
      // Verify the device token
      // In a real implementation, you would use proper token verification
      return device && device.token === token;
    } catch (error) {
      console.error('Error verifying IoT device:', error);
      return false;
    }
  }
}

export default IoTService;