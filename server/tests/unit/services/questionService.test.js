jest.mock('../../../models/questionNotification.model');
jest.mock('../../../models/taskQuestion.model');
jest.mock('../../../models/expertFarm.model');

const questionService = require('../../../services/questionNotification.service');
const QuestionNotification = require('../../../models/questionNotification.model');
const TaskQuestion = require('../../../models/taskQuestion.model');
const ExpertFarm = require('../../../models/expertFarm.model');

const BadRequestException = require('../../../middlewares/exceptions/badrequest');

describe('Question Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getList', () => {
    it('should return list mapped with populated fields for a farm', async () => {
      const farmId = '507f1f77bcf86cd799439011';
      const mockDocs = [
        {
          toObject: () => ({ _id: 'qn1' }),
          userId: { _id: 'u1', fullName: 'User 1', email: 'u1@example.com', role: 'farmer' },
          questionId: { _id: 'q1', title: 'Question 1' },
          farmId: { _id: farmId, name: 'Farm' },
          treeId: { _id: 't1', name: 'Tree' },
        },
      ];

      QuestionNotification.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockDocs),
              }),
            }),
          }),
        }),
      });

      const result = await questionService.getList(farmId);

      expect(QuestionNotification.find).toHaveBeenCalledWith({ farmId });
      expect(result[0]).toMatchObject({ user: { _id: 'u1' }, question: { _id: 'q1' }, farm: { _id: farmId }, tree: { _id: 't1' } });
    });
  });

  describe('getListByUser', () => {
    it('should return list mapped for expert farms', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const farmIds = ['507f1f77bcf86cd799439012'];
      ExpertFarm.find.mockResolvedValue([{ farmId: farmIds[0] }]);
      const mockDocs = [
        {
          toObject: () => ({ _id: 'qn1' }),
          userId: { _id: 'u1', fullName: 'User 1' },
          questionId: { _id: 'q1' },
          farmId: { _id: farmIds[0] },
          treeId: { _id: 't1' },
        },
      ];
      QuestionNotification.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockDocs),
              }),
            }),
          }),
        }),
      });
      const result = await questionService.getListByUser(userId);
      expect(result[0]).toMatchObject({ user: { _id: 'u1' }, question: { _id: 'q1' }, farm: { _id: farmIds[0] }, tree: { _id: 't1' } });
    });
  });

  describe('create', () => {
    it('should throw NotFoundException when task question not found', async () => {
      const data = { questionId: '507f1f77bcf86cd799439012' };
      TaskQuestion.findById.mockResolvedValue(null);
      await expect(questionService.create(data)).rejects.toThrow('Not found TaskQuestion with id: ' + data.questionId);
    });

    it('should create question notification with farmId and treeId from taskQuestion', async () => {
      const data = { questionId: '507f1f77bcf86cd799439012', userId: 'u1' };
      const mockTaskQuestion = { _id: data.questionId, farmId: '507f1f77bcf86cd799439014', treeId: '507f1f77bcf86cd799439015' };
      const saved = { _id: 'qn1', ...data, farmId: mockTaskQuestion.farmId, treeId: mockTaskQuestion.treeId };
      TaskQuestion.findById.mockResolvedValue(mockTaskQuestion);
      QuestionNotification.mockImplementation(() => ({ ...saved, save: jest.fn().mockResolvedValue(saved) }));
      const result = await questionService.create(data);
      expect(QuestionNotification).toHaveBeenCalledWith({ ...data, farmId: mockTaskQuestion.farmId, treeId: mockTaskQuestion.treeId });
      expect(result).toMatchObject(saved);
    });
  });

  describe('markRead', () => {
    it('should add userId to readBy set', async () => {
      const notificationId = '507f1f77bcf86cd799439012';
      const userId = '507f1f77bcf86cd799439011';
      QuestionNotification.findByIdAndUpdate.mockResolvedValue({});
      await questionService.markRead(notificationId, userId);
      expect(QuestionNotification.findByIdAndUpdate).toHaveBeenCalledWith(
        notificationId,
        { $addToSet: { readBy: userId } },
        { new: true }
      );
    });
  });

  describe('getTotalUnread', () => {
    it('should count unread for expert role across assigned farms', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const role = 'expert';
      const expertFarms = [{ farmId: '507f1f77bcf86cd799439012' }, { farmId: '507f1f77bcf86cd799439013' }];
      ExpertFarm.find.mockResolvedValue(expertFarms);
      QuestionNotification.countDocuments.mockResolvedValue(3);
      const result = await questionService.getTotalUnread(userId, role);
      expect(ExpertFarm.find).toHaveBeenCalledWith({ expertId: userId });
      expect(QuestionNotification.countDocuments).toHaveBeenCalledWith({
        farmId: { $in: expertFarms.map(f => f.farmId) },
        readBy: { $ne: userId },
      });
      expect(result).toBe(3);
    });

    it('should count unread for non-expert role within a farm', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const role = 'farmer';
      const farmId = '507f1f77bcf86cd799439012';
      QuestionNotification.countDocuments.mockResolvedValue(2);
      const result = await questionService.getTotalUnread(userId, role, farmId);
      expect(QuestionNotification.countDocuments).toHaveBeenCalledWith({
        farmId: farmId,
        readBy: { $ne: userId },
      });
      expect(result).toBe(2);
    });
  });
});
