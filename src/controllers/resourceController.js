const Resource = require('../models/resourceModel');
const factory = require('./handlerFactory');

exports.getAllResources = factory.getAll(Resource);
exports.getResource = factory.getOne(Resource);
exports.createResource = factory.createOne(Resource);
exports.updateResource = factory.updateOne(Resource);
exports.deleteResource = factory.deleteOne(Resource);
