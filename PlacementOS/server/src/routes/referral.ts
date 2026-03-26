import express from 'express';
import ReferralProvider from '../models/ReferralProvider.js';
import ReferralRequest from '../models/ReferralRequest.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth as any);

// ----------------- PROVIDER ROUTES ----------------- //

// Register or update provider profile
router.post('/register-provider', async (req: any, res: any) => {
  try {
    const { name, company, role, linkedinUrl, college, rolesReferredFor, maxReferralsPerMonth, isActive } = req.body;
    
    let provider = await ReferralProvider.findOne({ userId: req.user.userId });
    
    if (provider) {
      provider.name = name;
      provider.company = company;
      provider.role = role;
      provider.linkedinUrl = linkedinUrl;
      provider.college = college;
      provider.rolesReferredFor = rolesReferredFor;
      provider.maxReferralsPerMonth = maxReferralsPerMonth;
      provider.isActive = isActive;
      provider.updatedAt = new Date();
      await provider.save();
    } else {
      provider = new ReferralProvider({
        userId: req.user.userId,
        name,
        company,
        role,
        linkedinUrl,
        college,
        rolesReferredFor,
        maxReferralsPerMonth,
        isActive: isActive !== undefined ? isActive : true
      });
      await provider.save();
    }
    
    res.status(200).json(provider);
  } catch (error) {
    console.error("Register provider error:", error);
    res.status(500).json({ message: 'Server error registering provider' });
  }
});

// Check if current user is provider
router.get('/me', async (req: any, res: any) => {
  try {
    const provider = await ReferralProvider.findOne({ userId: req.user.userId });
    res.status(200).json(provider);
  } catch (error) {
    res.status(500).json({ message: 'Error checking provider status' });
  }
});

// Get all providers (Search for students)
router.get('/providers', async (req: any, res: any) => {
  try {
    const { company, role, college } = req.query;
    
    let query: any = { isActive: true };
    // Filter out the current user (don't refer yourself)
    query.userId = { $ne: req.user.userId };

    if (company) query.company = { $regex: new RegExp(company, 'i') };
    if (role) query.rolesReferredFor = { $regex: new RegExp(role, 'i') };
    if (college) query.college = { $regex: new RegExp(college, 'i') };

    const providers = await ReferralProvider.find(query)
      .sort({ responseRate: -1, totalReferralsGiven: -1 })
      .limit(50);
      
    res.status(200).json(providers);
  } catch (error) {
    console.error("Get providers error:", error);
    res.status(500).json({ message: 'Server error fetching providers' });
  }
});

// ----------------- REQUEST ROUTES ----------------- //

// Student requests a referral
router.post('/request', async (req: any, res: any) => {
  try {
    const { toProviderId, requesterName, requesterEmail, linkedinUrl, resumeUrl, targetRole, message } = req.body;
    
    // Check if provider exists and is active
    const provider = await ReferralProvider.findById(toProviderId);
    if (!provider || !provider.isActive) {
      return res.status(400).json({ message: 'Provider is not available' });
    }

    if (provider.currentReferralsThisMonth >= provider.maxReferralsPerMonth) {
      return res.status(400).json({ message: 'Provider has reached their monthly limit' });
    }

    const request = new ReferralRequest({
      fromUserId: req.user.userId,
      toProviderId,
      requesterName,
      requesterEmail,
      linkedinUrl,
      resumeUrl,
      targetRole,
      message
    });
    
    await request.save();
    res.status(201).json(request);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already requested a referral from this person.' });
    }
    console.error("Request referral error:", error);
    res.status(500).json({ message: 'Server error requesting referral' });
  }
});

// Provider gets their incoming requests
router.get('/incoming-requests', async (req: any, res: any) => {
  try {
    const provider = await ReferralProvider.findOne({ userId: req.user.userId });
    if (!provider) return res.status(200).json([]);

    const requests = await ReferralRequest.find({ toProviderId: provider.id })
                                          .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Get incoming requests error:", error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

// Student gets their outgoing requests
router.get('/outgoing-requests', async (req: any, res: any) => {
  try {
    const requests = await ReferralRequest.find({ fromUserId: req.user.userId })
                                          .populate('toProviderId', 'name company role')
                                          .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Get outgoing requests error:", error);
    res.status(500).json({ message: 'Server error fetching your requests' });
  }
});

// Provider updates request status (Accept/Decline)
router.put('/request/:id', async (req: any, res: any) => {
  try {
    const { status } = req.body; // 'Accepted' or 'Declined'
    
    const provider = await ReferralProvider.findOne({ userId: req.user.userId });
    if (!provider) return res.status(401).json({ message: 'Not authorized' });

    const request = await ReferralRequest.findOne({ _id: req.params.id, toProviderId: provider.id });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    request.updatedAt = new Date();
    await request.save();

    if (status === 'Accepted') {
      provider.totalReferralsGiven += 1;
      provider.currentReferralsThisMonth += 1;
      await provider.save();
    }

    res.status(200).json(request);
  } catch (error) {
    console.error("Update request error:", error);
    res.status(500).json({ message: 'Server error updating request' });
  }
});

export default router;
