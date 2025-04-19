import { Express } from 'express';
import { storage } from '../storage';
import { insertAddressSchema } from '@shared/schema';
import { validateBody } from '../middleware/zod-middleware';

export function registerAddressRoutes(app: Express) {
  // Get all addresses for the authenticated user
  app.get('/api/addresses', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const addresses = await storage.getAddressesByUserId(req.user.id);
      res.json(addresses);
    } catch (error: any) {
      console.error('Error fetching addresses:', error);
      res.status(500).json({ message: 'Failed to fetch addresses' });
    }
  });

  // Get a specific address
  app.get('/api/addresses/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
      return res.status(400).json({ message: 'Invalid address ID' });
    }

    try {
      const address = await storage.getAddressById(addressId);
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }

      // Check if the address belongs to the authenticated user
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to access this address' });
      }

      res.json(address);
    } catch (error: any) {
      console.error('Error fetching address:', error);
      res.status(500).json({ message: 'Failed to fetch address' });
    }
  });

  // Create a new address
  app.post('/api/addresses', validateBody(insertAddressSchema.omit({ userId: true })), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const addressData = {
        ...req.body,
        userId: req.user.id,
      };

      // If this is the first address for the user, or isDefault is true, make it the default
      const existingAddresses = await storage.getAddressesByUserId(req.user.id);
      const isFirstAddress = existingAddresses.length === 0;
      
      if (isFirstAddress || addressData.isDefault) {
        addressData.isDefault = true;
      }

      // Create the new address
      const newAddress = await storage.createAddress(addressData);

      // If this is set as default, update the user's defaultShippingAddressId
      if (newAddress.isDefault) {
        await storage.setDefaultAddress(req.user.id, newAddress.id);
      }

      res.status(201).json(newAddress);
    } catch (error: any) {
      console.error('Error creating address:', error);
      res.status(500).json({ message: 'Failed to create address' });
    }
  });

  // Update an address
  app.patch('/api/addresses/:id', validateBody(insertAddressSchema.omit({ userId: true }).partial()), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
      return res.status(400).json({ message: 'Invalid address ID' });
    }

    try {
      // Get the address to check ownership
      const address = await storage.getAddressById(addressId);
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }

      // Check if the address belongs to the authenticated user
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to update this address' });
      }

      // Update the address
      const updatedAddress = await storage.updateAddress(addressId, req.body);

      // If the address is set as default, update the user's defaultShippingAddressId
      if (req.body.isDefault === true) {
        await storage.setDefaultAddress(req.user.id, addressId);
      }

      res.json(updatedAddress);
    } catch (error: any) {
      console.error('Error updating address:', error);
      res.status(500).json({ message: 'Failed to update address' });
    }
  });

  // Delete an address
  app.delete('/api/addresses/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
      return res.status(400).json({ message: 'Invalid address ID' });
    }

    try {
      // Get the address to check ownership
      const address = await storage.getAddressById(addressId);
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }

      // Check if the address belongs to the authenticated user
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to delete this address' });
      }

      // Delete the address
      await storage.deleteAddress(addressId);

      // If this was the default address, we might want to set another address as default
      if (address.isDefault) {
        const remainingAddresses = await storage.getAddressesByUserId(req.user.id);
        if (remainingAddresses.length > 0) {
          await storage.setDefaultAddress(req.user.id, remainingAddresses[0].id);
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting address:', error);
      res.status(500).json({ message: 'Failed to delete address' });
    }
  });

  // Set an address as default
  app.post('/api/addresses/:id/default', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const addressId = parseInt(req.params.id);
    if (isNaN(addressId)) {
      return res.status(400).json({ message: 'Invalid address ID' });
    }

    try {
      // Get the address to check ownership
      const address = await storage.getAddressById(addressId);
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }

      // Check if the address belongs to the authenticated user
      if (address.userId !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to modify this address' });
      }

      // Set as default in the addresses table
      await storage.setDefaultAddress(req.user.id, addressId);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error setting default address:', error);
      res.status(500).json({ message: 'Failed to set default address' });
    }
  });
}