import { NextRequest } from 'next/server';
import { POST } from '../../app/api/cost-calculator/route';

// Mock NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: jest.fn().mockImplementation((body, options) => ({
        body,
        options,
      })),
    },
  };
});

describe('Cost Calculator API', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to create a mock request with the given body
  const createRequest = (body: any): NextRequest => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  describe('POST handler', () => {
    it('should calculate total cost correctly with valid inputs', async () => {
      // Arrange
      const requestBody = {
        materials: 100,
        labor: 200,
        overhead: 150,
      };
      const request = createRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      expect(response.body).toHaveProperty('totalCost', 450);
      expect(response.body).toHaveProperty('breakdown');
      expect(response.body.breakdown).toEqual({
        materials: 100,
        labor: 200,
        overhead: 150,
      });
      expect(response.body).toHaveProperty('timestamp');
      expect(response.options).toBeUndefined();
    });

    it('should handle zero values correctly', async () => {
      // Arrange
      const requestBody = {
        materials: 0,
        labor: 0,
        overhead: 0,
      };
      const request = createRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      expect(response.body).toHaveProperty('totalCost', 0);
      expect(response.body.breakdown).toEqual({
        materials: 0,
        labor: 0,
        overhead: 0,
      });
    });

    it('should return 400 error when materials cost is missing', async () => {
      // Arrange
      const requestBody = {
        labor: 200,
        overhead: 150,
      };
      const request = createRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      expect(response.body).toHaveProperty(
        'error',
        'Materials cost must be a valid non-negative number'
      );
      expect(response.options).toHaveProperty('status', 400);
    });

    it('should return 400 error when labor cost is missing', async () => {
      // Arrange
      const requestBody = {
        materials: 100,
        overhead: 150,
      };
      const request = createRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      expect(response.body).toHaveProperty(
        'error',
        'Labor cost must be a valid non-negative number'
      );
      expect(response.options).toHaveProperty('status', 400);
    });

    it('should return 400 error when overhead cost is missing', async () => {
      // Arrange
      const requestBody = {
        materials: 100,
        labor: 200,
      };
      const request = createRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      expect(response.body).toHaveProperty(
        'error',
        'Overhead cost must be a valid non-negative number'
      );
      expect(response.options).toHaveProperty('status', 400);
    });

    it('should return 400 error when materials cost is negative', async () => {
      // Arrange
      const requestBody = {
        materials: -100,
        labor: 200,
        overhead: 150,
      };
      const request = createRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      expect(response.body).toHaveProperty(
        'error',
        'Materials cost must be a valid non-negative number'
      );
      expect(response.options).toHaveProperty('status', 400);
    });

    it('should return 400 error when labor cost is negative', async () => {
      // Arrange
      const requestBody = {
        materials: 100,
        labor: -200,
        overhead: 150,
      };
      const request = createRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      expect(response.body).toHaveProperty(
        'error',
        'Labor cost must be a valid non-negative number'
      );
      expect(response.options).toHaveProperty('status', 400);
    });

    it('should return 400 error when overhead cost is negative', async () => {
      // Arrange
      const requestBody = {
        materials: 100,
        labor: 200,
        overhead: -150,
      };
      const request = createRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      expect(response.body).toHaveProperty(
        'error',
        'Overhead cost must be a valid non-negative number'
      );
      expect(response.options).toHaveProperty('status', 400);
    });

    it('should return 400 error when materials cost is NaN', async () => {
      // Arrange
      const requestBody = {
        materials: NaN,
        labor: 200,
        overhead: 150,
      };
      const request = createRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      expect(response.body).toHaveProperty(
        'error',
        'Materials cost must be a valid non-negative number'
      );
      expect(response.options).toHaveProperty('status', 400);
    });

    it('should return 400 error when request body is invalid JSON', async () => {
      // Arrange
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest;

      // Act
      const response = await POST(request);

      // Assert
      expect(response.body).toHaveProperty('error', 'Invalid request format');
      expect(response.options).toHaveProperty('status', 400);
    });

    it('should return 400 error when costs are provided as strings', async () => {
      // Arrange
      const requestBody = {
        materials: '100',
        labor: '200',
        overhead: '150',
      };
      const request = createRequest(requestBody);

      // Act
      const response = await POST(request);

      // Assert
      expect(response.body).toHaveProperty(
        'error',
        'Materials cost must be a valid non-negative number'
      );
      expect(response.options).toHaveProperty('status', 400);
    });
  });
});
