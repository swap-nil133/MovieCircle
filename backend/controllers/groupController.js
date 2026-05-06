const Group = require('../models/Group');
const User = require('../models/User');
const Movie = require('../models/Movie');

// POST /api/groups - Create a group
const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const group = await Group.create({
      name,
      description: description || '',
      owner: req.user._id,
      members: [req.user._id],
    });

    // Add group to user's groups
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { groups: group._id },
    });

    const populated = await Group.findById(group._id)
      .populate('owner', 'username email')
      .populate('members', 'username email');

    res.status(201).json({ message: 'Group created successfully', group: populated });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: 'Server error creating group' });
  }
};

// GET /api/groups - Get all groups for current user
const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .sort({ createdAt: -1 });

    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching groups' });
  }
};

// GET /api/groups/:id - Get single group
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('members', 'username email')
      .populate({
        path: 'movies',
        populate: { path: 'addedBy', select: 'username email' },
      });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    res.json({ group });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching group' });
  }
};

// POST /api/groups/join - Join a group via invite code
const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ message: 'Invite code is required' });
    }

    const group = await Group.findOne({ inviteCode: inviteCode.trim().toUpperCase() })
      .populate('owner', 'username email')
      .populate('members', 'username email');

    if (!group) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if already a member
    const alreadyMember = group.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    group.members.push(req.user._id);
    await group.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { groups: group._id },
    });

    const populated = await Group.findById(group._id)
      .populate('owner', 'username email')
      .populate('members', 'username email');

    res.json({ message: `Joined "${group.name}" successfully`, group: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error joining group' });
  }
};

// DELETE /api/groups/:id/leave - Leave a group
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Group owner cannot leave the group. Delete it instead.' });
    }

    group.members = group.members.filter(
      (m) => m.toString() !== req.user._id.toString()
    );
    await group.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { groups: group._id },
    });

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error leaving group' });
  }
};

module.exports = { createGroup, getMyGroups, getGroup, joinGroup, leaveGroup };
