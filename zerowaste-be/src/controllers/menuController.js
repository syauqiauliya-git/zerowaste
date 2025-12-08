import DailyMenu from '../models/DailyMenu.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

// Handler for POST /api/v1/menus
export const createMenu = catchAsync(async (req, res, next) => {
  // Inject the User ID and SPPG ID from the JWT payload into the request body
  req.body.created_by = req.user._id;

  if (req.user.role === 'sppg_staff' && req.user.sppg_id) {
    req.body.sppg = req.user.sppg_id;
  }

  const newMenu = await DailyMenu.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      menu: newMenu,
    },
  });
});

// Handler for GET /api/v1/menus
export const getAllMenus = catchAsync(async (req, res, next) => {
  const filter = {};

  if (req.user.role === 'sppg_staff' && req.user.sppg_id) {
    filter.sppg = req.user.sppg_id;
  }

  // Use .populate() to retrieve referenced data (SPPG, School, User) for display
  const menus = await DailyMenu.find(filter)
    .populate('sppg', 'name')
    .populate('school', 'school_name')
    .populate('created_by', 'email');

  res.status(200).json({
    status: 'success',
    results: menus.length,
    data: {
      menus,
    },
  });
});

// Handler for GET /api/v1/menus/:id
export const getMenu = catchAsync(async (req, res, next) => {
  const menu = await DailyMenu.findById(req.params.id)
    .populate('sppg', 'name')
    .populate('school', 'school_name');

  if (!menu) {
    return next(new AppError('Menu dengan ID tersebut tidak ditemukan', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      menu,
    },
  });
});

// Handler for PUT /api/v1/menus/:id
export const updateMenu = catchAsync(async (req, res, next) => {
  // We don't allow updating created_by, but the rest of the body is fine.
  const updatedMenu = await DailyMenu.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedMenu) {
    return next(new AppError('Menu dengan ID tersebut tidak ditemukan', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      menu: updatedMenu,
    },
  });
});

// Handler for DELETE /api/v1/menus/:id
export const deleteMenu = catchAsync(async (req, res, next) => {
  const menu = await DailyMenu.findByIdAndDelete(req.params.id);

  if (!menu) {
    return next(new AppError('Menu dengan ID tersebut tidak ditemukan', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export default {
    createMenu,
    getAllMenus,
    getMenu,
    updateMenu,
    deleteMenu,
};
