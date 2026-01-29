import { createInvitation, validateInvitation, acceptInvitation, getInvitationsByUnit, revokeInvitation } from './inviteService';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const API_URL = '/api/invitations';

// Mock server
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('inviteService', () => {

  it('createInvitation calls POST /invitations with correct body', async () => {
    const mockData = { id: 1, inviteeEmail: 'test@example.com' };
    server.use(
      rest.post(API_URL, (req, res, ctx) => {
        expect(req.body).toEqual({
          unitId: 101,
          inviteeEmail: 'test@example.com'
        });
        return res(ctx.status(200), ctx.json(mockData));
      })
    );

    const result = await createInvitation(101, 'test@example.com');
    expect(result).toEqual(mockData);
  });

  it('validateInvitation calls POST /invitations/validate', async () => {
    const mockData = { invitationCode: 'ABC123', status: 'PENDING' };
    server.use(
      rest.post(`${API_URL}/validate`, (req, res, ctx) => {
        expect(req.body).toEqual({
          invitationCode: 'ABC123',
          email: 'test@example.com'
        });
        return res(ctx.status(200), ctx.json(mockData));
      })
    );

    const result = await validateInvitation('ABC123', 'test@example.com');
    expect(result).toEqual(mockData);
  });

  it('acceptInvitation calls POST /invitations/{code}/accept', async () => {
    const mockData = { invitationCode: 'ABC123', status: 'ACCEPTED' };
    server.use(
      rest.post(`${API_URL}/ABC123/accept`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockData));
      })
    );

    const result = await acceptInvitation('ABC123');
    expect(result).toEqual(mockData);
  });

  it('getInvitationsByUnit calls GET /invitations/unit/{unitId}', async () => {
    const mockData = [{ id: 1, inviteeEmail: 'test@example.com' }];
    server.use(
      rest.get(`${API_URL}/unit/101`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockData));
      })
    );

    const result = await getInvitationsByUnit(101);
    expect(result).toEqual(mockData);
  });

  it('revokeInvitation calls DELETE /invitations/{id}', async () => {
    server.use(
      rest.delete(`${API_URL}/1`, (req, res, ctx) => {
        return res(ctx.status(204));
      })
    );

    await expect(revokeInvitation(1)).resolves.toBeUndefined();
  });

});