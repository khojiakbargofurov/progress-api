const APIFeatures = require('../utils/apiFeatures');

// We should implement specific controllers for Blogs/Resources, but to save time/space 
// and demonstrate clean architecture, I'll create simple controllers directly.
// Ideally, we'd have a factory handler, but I'll write them out for clarity.

exports.getAll = (Model) => async (req, res) => {
    try {
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);

        let query = Model.find(queryObj);
        if (req.query.sort) query = query.sort(req.query.sort.split(',').join(' '));

        const docs = await query;

        res.status(200).json({
            status: 'success',
            results: docs.length,
            data: { data: docs },
        });
    } catch (err) {
        res.status(404).json({ status: 'fail', message: err.message });
    }
};

exports.createOne = (Model) => async (req, res) => {
    try {
        if (req.user && !req.body.author) req.body.author = req.user.id; // Auto-set author
        const doc = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { data: doc },
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getOne = (Model) => async (req, res) => {
    try {
        const doc = await Model.findById(req.params.id);
        if (!doc) return res.status(404).json({ status: 'fail', message: 'No document found with that ID' });
        res.status(200).json({ status: 'success', data: { data: doc } });
    } catch (err) {
        res.status(404).json({ status: 'fail', message: err.message });
    }
};

exports.updateOne = (Model) => async (req, res) => {
    try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!doc) return res.status(404).json({ status: 'fail', message: 'No document found with that ID' });
        res.status(200).json({ status: 'success', data: { data: doc } });
    } catch (err) {
        res.status(404).json({ status: 'fail', message: err.message });
    }
};

exports.deleteOne = (Model) => async (req, res) => {
    try {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ status: 'fail', message: 'No document found with that ID' });
        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        res.status(404).json({ status: 'fail', message: err.message });
    }
};
