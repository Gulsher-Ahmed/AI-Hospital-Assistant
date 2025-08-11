const fs = require('fs');
const path = require('path');

/**
 * Database Service - Handles data operations
 * 
 * This service provides methods to interact with the JSON database
 * for appointments, doctors, HR policies, and company information.
 */
class DatabaseService {
  constructor() {
    this.dbPath = path.join(__dirname, '../data/database.json');
    this.data = this.loadDatabase();
  }

  /**
   * Load database from JSON file
   */
  loadDatabase() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const rawData = fs.readFileSync(this.dbPath, 'utf8');
        return JSON.parse(rawData);
      } else {
        console.warn('⚠️  Database file not found. Creating empty database.');
        return { doctors: [], appointments: [], hr_policies: {}, company_info: {} };
      }
    } catch (error) {
      console.error('❌ Error loading database:', error);
      return { doctors: [], appointments: [], hr_policies: {}, company_info: {} };
    }
  }

  /**
   * Save database to JSON file
   */
  saveDatabase() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
      return true;
    } catch (error) {
      console.error('❌ Error saving database:', error);
      return false;
    }
  }

  /**
   * Get all doctors
   */
  getDoctors() {
    return this.data.doctors || [];
  }

  /**
   * Get doctor by ID
   */
  getDoctorById(id) {
    return this.data.doctors?.find(doctor => doctor.id === parseInt(id));
  }

  /**
   * Get available appointments for a doctor
   */
  getAvailableSlots(doctorId = null) {
    const doctors = doctorId ? [this.getDoctorById(doctorId)] : this.getDoctors();
    const availableSlots = [];

    doctors.forEach(doctor => {
      if (doctor && doctor.available_times) {
        doctor.available_times.forEach(time => {
          // Check if slot is not already booked
          const isBooked = this.data.appointments?.some(apt => 
            apt.doctor_id === doctor.id && 
            apt.appointment_time === time && 
            apt.status === 'confirmed'
          );

          if (!isBooked) {
            availableSlots.push({
              doctor_id: doctor.id,
              doctor_name: doctor.name,
              specialty: doctor.specialty,
              time: time,
              formatted_time: new Date(time).toLocaleString()
            });
          }
        });
      }
    });

    return availableSlots;
  }

  /**
   * Book an appointment
   */
  bookAppointment(patientName, doctorId, appointmentTime, reason, sessionId) {
    try {
      const doctor = this.getDoctorById(doctorId);
      if (!doctor) {
        return { success: false, message: 'Doctor not found' };
      }

      // Check if slot is available
      const isAvailable = doctor.available_times?.includes(appointmentTime);
      if (!isAvailable) {
        return { success: false, message: 'Time slot not available' };
      }

      // Check if already booked
      const isBooked = this.data.appointments?.some(apt => 
        apt.doctor_id === doctorId && 
        apt.appointment_time === appointmentTime && 
        apt.status === 'confirmed'
      );

      if (isBooked) {
        return { success: false, message: 'Time slot already booked' };
      }

      // Create new appointment
      const newAppointment = {
        id: (this.data.appointments?.length || 0) + 1,
        patient_name: patientName,
        doctor_id: doctorId,
        doctor_name: doctor.name,
        appointment_time: appointmentTime,
        status: 'confirmed',
        reason: reason || 'General consultation',
        session_id: sessionId,
        created_at: new Date().toISOString()
      };

      this.data.appointments = this.data.appointments || [];
      this.data.appointments.push(newAppointment);
      
      if (this.saveDatabase()) {
        return { 
          success: true, 
          message: 'Appointment booked successfully',
          appointment: newAppointment
        };
      } else {
        return { success: false, message: 'Failed to save appointment' };
      }
    } catch (error) {
      console.error('❌ Error booking appointment:', error);
      return { success: false, message: 'Internal error occurred' };
    }
  }

  /**
   * Get appointments by session ID
   */
  getAppointmentsBySession(sessionId) {
    return this.data.appointments?.filter(apt => apt.session_id === sessionId) || [];
  }

  /**
   * Cancel an appointment
   */
  cancelAppointment(appointmentId, sessionId) {
    try {
      const appointmentIndex = this.data.appointments?.findIndex(apt => 
        apt.id === parseInt(appointmentId) && apt.session_id === sessionId
      );

      if (appointmentIndex === -1) {
        return { success: false, message: 'Appointment not found' };
      }

      this.data.appointments[appointmentIndex].status = 'cancelled';
      this.data.appointments[appointmentIndex].cancelled_at = new Date().toISOString();

      if (this.saveDatabase()) {
        return { 
          success: true, 
          message: 'Appointment cancelled successfully',
          appointment: this.data.appointments[appointmentIndex]
        };
      } else {
        return { success: false, message: 'Failed to cancel appointment' };
      }
    } catch (error) {
      console.error('❌ Error cancelling appointment:', error);
      return { success: false, message: 'Internal error occurred' };
    }
  }

  /**
   * Get HR policies
   */
  getHRPolicies() {
    return this.data.hr_policies || {};
  }

  /**
   * Get company information
   */
  getCompanyInfo() {
    return this.data.company_info || {};
  }

  /**
   * Get all appointments (for admin purposes)
   */
  getAllAppointments() {
    return this.data.appointments || [];
  }
}

module.exports = new DatabaseService();
