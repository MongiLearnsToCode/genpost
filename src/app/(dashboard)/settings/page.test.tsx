import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from './page'; // The component to test
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

// Mock Clerk's useUser hook
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

// Mock sonner's toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Next.js router if needed for redirects, though not directly used in this component's save logic
// jest.mock('next/navigation', () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//   }),
// }));

const mockUser = {
  id: 'user_123',
  firstName: 'John',
  lastName: 'Doe',
  imageUrl: 'https://example.com/avatar.png',
  primaryEmailAddress: {
    emailAddress: 'john.doe@example.com',
  },
  update: jest.fn(),
};

describe('SettingsPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoaded: true,
    });
    mockUser.update.mockResolvedValue({});
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
  });

  it('renders loading state initially when isLoaded is false', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: false,
    });
    render(<SettingsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders user not found when user is null and isLoaded is true', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });
    render(<SettingsPage />);
    expect(screen.getByText('User not found.')).toBeInTheDocument();
  });

  it('renders the profile form with user data', () => {
    render(<SettingsPage />);
    expect(screen.getByLabelText(/First Name/i)).toHaveValue(mockUser.firstName);
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue(mockUser.lastName);
    expect(screen.getByLabelText(/Email/i)).toHaveValue(mockUser.primaryEmailAddress.emailAddress);
    expect(screen.getByLabelText(/Email/i)).toBeDisabled();
    expect(screen.getByLabelText(/Profile Image URL/i)).toHaveValue(mockUser.imageUrl);
    expect(screen.getByAltText('Profile preview')).toHaveAttribute('src', mockUser.imageUrl);
  });

  it('allows updating first name, last name, and image URL', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const imageUrlInput = screen.getByLabelText(/Profile Image URL/i);

    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Doette');
    await user.clear(imageUrlInput);
    await user.type(imageUrlInput, 'https://example.com/new-avatar.png');

    expect(firstNameInput).toHaveValue('Jane');
    expect(lastNameInput).toHaveValue('Doette');
    expect(imageUrlInput).toHaveValue('https://example.com/new-avatar.png');
  });

  it('calls user.update with updated data on save and shows success toast', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const imageUrlInput = screen.getByLabelText(/Profile Image URL/i);
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });

    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Doette');
    // To ensure the second user.update for imageUrl is called
    const newImageUrl = 'https://example.com/new-avatar.png';
    await user.clear(imageUrlInput);
    await user.type(imageUrlInput, newImageUrl);

    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUser.update).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Doette',
      });
    });

    await waitFor(() => {
        expect(mockUser.update).toHaveBeenCalledWith({
            imageUrl: newImageUrl,
        });
    });

    expect(mockUser.update).toHaveBeenCalledTimes(2); // Once for names, once for image URL

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully!');
    });
  });

  it('shows error toast if user.update fails', async () => {
    const user = userEvent.setup();
    mockUser.update.mockRejectedValueOnce(new Error('Update failed'));
    render(<SettingsPage />);

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update profile. Please try again.');
    });
  });

  it('disables form elements while saving', async () => {
    const user = userEvent.setup();
    // Make the update promise hang so we can check the disabled state
    mockUser.update.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({}), 100)));
    render(<SettingsPage />);

    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(screen.getByLabelText(/First Name/i)).toBeDisabled();
    expect(screen.getByLabelText(/Last Name/i)).toBeDisabled();
    expect(screen.getByLabelText(/Profile Image URL/i)).toBeDisabled();

    // Wait for the update to complete to avoid errors about state updates on unmounted components
    await waitFor(() => expect(saveButton).not.toBeDisabled());
  });
});
