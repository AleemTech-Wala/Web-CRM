
import React from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';

// Generic reusable form component
function GenericForm({ title = 'Register', fields = [], onSubmit }) {
	const [values, setValues] = React.useState(() => {
		const obj = {};
		fields.forEach(f => { obj[f.name] = ''; });
		return obj;
	});
	const [errors, setErrors] = React.useState({});
	const [success, setSuccess] = React.useState('');

	const validatePassword = (pw) => {
		if (!pw || pw.length < 8) return 'Password must be at least 8 characters.';
		if (!/\d/.test(pw)) return 'Password must include at least one number.';
		return '';
	};

	const handleChange = (e) => {
		const newValues = { ...values, [e.target.name]: e.target.value };
		let newErrors = { ...errors };
		if (e.target.name === 'password') {
			newErrors.password = validatePassword(e.target.value);
			// Only show confirm password error if user has started typing in confirmPassword
			if (newValues.confirmPassword) {
				newErrors.confirmPassword = newValues.password !== newValues.confirmPassword ? 'Passwords do not match.' : '';
			} else {
				newErrors.confirmPassword = '';
			}
		} else if (e.target.name === 'confirmPassword') {
			newErrors.confirmPassword = newValues.password !== newValues.confirmPassword ? 'Passwords do not match.' : '';
		}
		setValues(newValues);
		setErrors(newErrors);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		let valid = true;
		let newErrors = {};
		if ('password' in values) {
			const msg = validatePassword(values.password);
			if (msg) {
				newErrors.password = msg;
				valid = false;
			}
		}
		if ('password' in values && 'confirmPassword' in values) {
			if (values.password !== values.confirmPassword) {
				newErrors.confirmPassword = 'Passwords do not match.';
				valid = false;
			}
		}
		setErrors(newErrors);
		if (valid) {
			setSuccess('Account created successfully!');
			if (onSubmit) onSubmit(values);
		} else {
			setSuccess('');
		}
	};

	return (
		<Box
			sx={{
				minHeight: '100vh',
				width: '100vw',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: 'Roboto, Arial, sans-serif',
				background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
			}}
		>
			<Paper
				elevation={6}
				sx={{
					padding: 3,
					borderRadius: 8,
					minWidth: 340,
					maxWidth: 400,
					boxShadow: '0 8px 32px 0 rgba(44, 62, 80, 0.18)',
					background: '#fff',
				}}
			>
				<Typography variant="h4" align="center" fontWeight={700} color="#2196f3" mb={1}>
					CRM
				</Typography>
				<Typography variant="subtitle1" align="center" color="#7f8c8d" mb={2}>
					Customer Relationship Management
				</Typography>
				<Typography variant="h6" align="center" fontWeight={600} color="#2196f3" mb={2}>
					Register Now
				</Typography>
				{success && (
					<Typography align="center" color="success.main" mb={2}>
						{success}
					</Typography>
				)}
				<Box component="form" onSubmit={handleSubmit}>
					{fields.map(field => (
						<TextField
							key={field.name}
							label={field.label}
							name={field.name}
							type={field.type || 'text'}
							variant="outlined"
							fullWidth
							margin="normal"
							value={values[field.name]}
							onChange={handleChange}
							required={field.required}
							error={!!errors[field.name]}
							helperText={errors[field.name] || ''}
						/>
					))}
					<Button
						type="submit"
						variant="contained"
						fullWidth
						sx={{ mt: 2, fontWeight: 'bold', bgcolor: '#2196f3', color: '#fff', '&:hover': { bgcolor: '#1769aa' } }}
					>
						{title}
					</Button>
				</Box>
			</Paper>
		</Box>
	);
}

// Example usage for registration
export default function Register() {
	
	// Frontend-only registration handler (no backend API call)
	const handleRegister = (userData) => {
		// Log the user data for development purposes
		console.log('🚀 Registration form submitted:', userData);
		
		// Show success message (frontend validation passed)
		alert(`✅ Form Validation Successful!\n\nName: ${userData.name || 'Not provided'}\nEmail: ${userData.email}\nPassword: ${'*'.repeat(userData.password.length)} characters\n\n⚠️ Note: Backend API not connected yet.`);
		
		// You can also display the data in a more user-friendly way
		console.log('📋 User Registration Data:', {
			name: userData.name || 'Not provided',
			email: userData.email,
			passwordLength: userData.password.length,
			timestamp: new Date().toISOString()
		});
	};
	
	return (
		<GenericForm
			title="Register"
			fields={[
				{ name: 'name', label: 'Full Name', type: 'text', required: false },
				{ name: 'email', label: 'Email', type: 'email', required: true },
				{ name: 'password', label: 'Password', type: 'password', required: true },
				{ name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true },
			]}
			onSubmit={handleRegister}
		/>
	);
}

