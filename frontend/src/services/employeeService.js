import axios from 'axios';

const API_URL = 'http://internal-a91fb2b3e17544d2ca613ed8b2510c59-611159952.us-east-2.elb.amazonaws.com/api/employees';

// Get all employees
export const getAllEmployees = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get employee by ID
export const getEmployeeById = async id => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Add a new employee
export const addEmployee = async employee => {
  const response = await axios.post(API_URL, employee);
  return response.data;
};

// Update an existing employee
export const updateEmployee = async (id, employee) => {
  const response = await axios.put(`${API_URL}/${id}`, employee);
  return response.data;
};

// Delete an employee
export const deleteEmployee = async id => {
  await axios.delete(`${API_URL}/${id}`);
};
