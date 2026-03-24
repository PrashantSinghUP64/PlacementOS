import express from 'express';
import SavedCompany from '../models/SavedCompany.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth as any);

// Save generated company profile
router.post('/save', async (req: any, res: any) => {
  try {
    const { companyName, researchData } = req.body;
    
    // Use upsert to prevent duplicates for same user+company
    const company = await SavedCompany.findOneAndUpdate(
      { userId: req.user.userId, companyName: { $regex: new RegExp(`^${companyName}$`, 'i') } },
      { userId: req.user.userId, companyName, researchData: JSON.stringify(researchData), savedAt: new Date() },
      { new: true, upsert: true }
    );
    
    res.status(200).json(company);
  } catch (error) {
    console.error("Save company research error:", error);
    res.status(500).json({ message: 'Server error saving company intel' });
  }
});

// Get user's saved companies
router.get('/', async (req: any, res: any) => {
  try {
    const companies = await SavedCompany.find({ userId: req.user.userId })
                                        .sort({ savedAt: -1 })
                                        .lean();
    
    // Parse the stringified JSON back to objects for the frontend
    const parsedCompanies = companies.map(c => ({
      ...c,
      researchData: JSON.parse(c.researchData as string)
    }));

    res.status(200).json(parsedCompanies);
  } catch (error) {
    console.error("Get saved companies error:", error);
    res.status(500).json({ message: 'Server error retrieving saved companies' });
  }
});

// Delete a saved company
router.delete('/:id', async (req: any, res: any) => {
  try {
    await SavedCompany.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.status(200).json({ message: 'Company removed from saved list' });
  } catch (error) {
    console.error("Delete saved company error:", error);
    res.status(500).json({ message: 'Server error deleting saved company' });
  }
});

export default router;
