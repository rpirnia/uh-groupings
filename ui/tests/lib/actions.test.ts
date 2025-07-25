import { vi, describe, beforeAll, it, expect, beforeEach, afterEach } from 'vitest';
import {
    updateOptOut,
    updateSyncDest,
    updateOptIn,
    addAdmin,
    addExcludeMembers,
    addExcludeMembersAsync,
    addIncludeMembers,
    addIncludeMembersAsync,
    addOwners,
    getGroupingMembersIsBasis,
    getGroupingMembersWhereListed,
    getNumberOfGroupingMembers,
    memberAttributeResults,
    memberAttributeResultsAsync,
    optIn,
    optOut,
    removeAdmin,
    removeExcludeMembers,
    removeFromGroups,
    removeIncludeMembers,
    removeOwners,
    resetExcludeGroup,
    resetExcludeGroupAsync,
    resetIncludeGroup,
    resetIncludeGroupAsync,
    sendFeedback,
    sendStackTrace,
    updateDescription,
    getGroupingMembers
} from '@/lib/actions';
import * as NextCasClient from 'next-cas-client/app';
import User from '@/lib/access/user';
import { Feedback } from '@/lib/types';
import SortBy from '@/app/groupings/[groupingPath]/@tab/_components/grouping-members-table/table-element/sort-by';

const baseUrl = process.env.NEXT_PUBLIC_API_2_1_BASE_URL as string;
const testUser: User = JSON.parse(process.env.TEST_USER_A as string);
const OPT_IN = process.env.NEXT_PUBLIC_OPT_IN as string;
const OPT_OUT = process.env.NEXT_PUBLIC_OPT_OUT as string;

vi.mock('next-cas-client/app');

describe('actions', () => {
    const currentUser = testUser;

    const uhIdentifier = 'testiwta';
    const uhIdentifiers = ['testiwta', 'testiwtb'];
    const groupingPath = 'tmp:testiwta:testiwta-aux';
    const groupPaths = [
        `${groupingPath}:include`,
        `${groupingPath}:include`,
        `${groupingPath}:exclude`,
        `${groupingPath}:owners`
    ];

    const mockResponse = {
        resultCode: 'SUCCESS'
    };
    const mockAsyncCompletedResponse = {
        status: 'COMPLETED',
        result: {
            resultCode: 'SUCCESS'
        }
    };
    const mockAsyncInProgressResponse = {
        status: 'IN_PROGRESS'
    };
    const mockError = {
        resultCode: 'FAILURE'
    };

    beforeAll(() => {
        vi.spyOn(NextCasClient, 'getCurrentUser').mockResolvedValue(testUser);
    });

    describe('updateSyncDest', () => {
        const syncDestId = 'uhgmail';
        const status = true;

        it('should make a PUT request at the correct endpoint', async () => {
            await updateSyncDest(groupingPath, syncDestId, status);

            expect(fetch).toHaveBeenCalledWith(
                `${baseUrl}/groupings/${groupingPath}/sync-destination/${syncDestId}/${status}`,
                {
                    method: 'PUT',
                    headers: {
                        current_user: currentUser.uid,
                        'Content-Type': 'application/json',
                    },
                },
            );
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await updateSyncDest(groupingPath, syncDestId, status)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await updateSyncDest(groupingPath, syncDestId, status)).toEqual(mockError);
        });
    });

    describe('updateOptIn', () => {
        const status = true;

        it('should make a PUT request at the correct endpoint', async () => {
            await updateOptIn(groupingPath, status);

            expect(fetch).toHaveBeenCalledWith(
                `${baseUrl}/groupings/${groupingPath}/opt-attribute/${OPT_IN}/${status}`,
                {
                    method: 'PUT',
                    headers: {
                        current_user: currentUser.uid,
                        'Content-Type': 'application/json',
                    },
                },
            );
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await updateOptIn(groupingPath, status)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await updateOptIn(groupingPath, status)).toEqual(mockError);
        });
    });

    describe('updateOptOut', () => {
        const status = false;

        it('should make a PUT request at the correct endpoint', async () => {
            await updateOptOut(groupingPath, status);

            expect(fetch).toHaveBeenCalledWith(
                `${baseUrl}/groupings/${groupingPath}/opt-attribute/${OPT_OUT}/${status}`,
                {
                    method: 'PUT',
                    headers: {
                        current_user: currentUser.uid,
                        'Content-Type': 'application/json',
                    },
                },
            );
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await updateOptOut(groupingPath, status)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await updateOptOut(groupingPath, status)).toEqual(mockError);
        });
    });

    describe('updateDescription', () => {
        const description = 'description';

        it('should make a POST request at the correct endpoint', async () => {
            await updateDescription(description, groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/description`, {
                body: description,
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'PUT'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await updateDescription(description, groupingPath)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await updateDescription(description, groupingPath)).toEqual(mockError);
        });
    });

    describe('AddIncludeMembers', () => {
        it('should make a PUT request at the correct endpoint', async () => {
            await addIncludeMembers(uhIdentifiers, groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/include-members`, {
                body: JSON.stringify(uhIdentifiers),
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'PUT'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await addIncludeMembers(uhIdentifiers, groupingPath)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await addIncludeMembers(uhIdentifiers, groupingPath)).toEqual(mockError);
        });
    });

    describe('addIncludeMembersAsync', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should make a PUT request at the correct endpoint', async () => {
            await addIncludeMembersAsync(uhIdentifiers, groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/include-members/async`, {
                body: JSON.stringify(uhIdentifiers),
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'PUT'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock
                .mockResponseOnce(JSON.stringify(0))
                .mockResponseOnce(JSON.stringify(mockAsyncInProgressResponse))
                .mockResponseOnce(JSON.stringify(mockAsyncCompletedResponse));

            const res = addIncludeMembersAsync(uhIdentifiers, groupingPath);
            await vi.advanceTimersByTimeAsync(5000);

            expect(await res).toEqual(mockAsyncCompletedResponse.result);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            let res = addIncludeMembersAsync(uhIdentifiers, groupingPath);
            expect(await res).toEqual(mockError);

            fetchMock.mockResponseOnce(JSON.stringify(0)).mockRejectOnce(() => Promise.reject(mockError));
            res = addIncludeMembersAsync(uhIdentifiers, groupingPath);
            await vi.advanceTimersByTimeAsync(5000);
            expect(await res).toEqual(mockError);
        });
    });

    describe('addExcludeMembers', () => {
        it('should make a PUT request at the correct endpoint', async () => {
            await addExcludeMembers(uhIdentifiers, groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/exclude-members`, {
                body: JSON.stringify(uhIdentifiers),
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'PUT'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await addExcludeMembers(uhIdentifiers, groupingPath)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await addExcludeMembers(uhIdentifiers, groupingPath)).toEqual(mockError);
        });
    });

    describe('addExcludeMembersAsync', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should make a PUT request at the correct endpoint', async () => {
            await addExcludeMembersAsync(uhIdentifiers, groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/exclude-members/async`, {
                body: JSON.stringify(uhIdentifiers),
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'PUT'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock
                .mockResponseOnce(JSON.stringify(0))
                .mockResponseOnce(JSON.stringify(mockAsyncInProgressResponse))
                .mockResponseOnce(JSON.stringify(mockAsyncCompletedResponse));

            const res = addExcludeMembersAsync(uhIdentifiers, groupingPath);
            await vi.advanceTimersByTimeAsync(5000);

            expect(await res).toEqual(mockAsyncCompletedResponse.result);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            let res = addExcludeMembersAsync(uhIdentifiers, groupingPath);
            expect(await res).toEqual(mockError);

            fetchMock.mockResponseOnce(JSON.stringify(0)).mockRejectOnce(() => Promise.reject(mockError));
            res = addExcludeMembersAsync(uhIdentifiers, groupingPath);
            await vi.advanceTimersByTimeAsync(5000);
            expect(await res).toEqual(mockError);
        });
    });

    describe('addOwners', () => {
        it('should make a POST request at the correct endpoint', async () => {
            await addOwners(uhIdentifiers, groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/owners/${uhIdentifiers}`, {
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await addOwners(uhIdentifiers, groupingPath)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await addOwners(uhIdentifiers, groupingPath)).toEqual(mockError);
        });
    });

    describe('addAdmin', () => {
        it('should make a POST request at the correct endpoint', async () => {
            await addAdmin(uhIdentifier);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/admins/${uhIdentifier}`, {
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await addAdmin(uhIdentifier)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await addAdmin(uhIdentifier)).toEqual(mockError);
        });
    });

    describe('removeFromGroups', () => {
        it('should make a DELETE request at the correct endpoint', async () => {
            await removeFromGroups(uhIdentifier, groupPaths);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/admins/${groupPaths}/${uhIdentifier}`, {
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await removeFromGroups(uhIdentifier, groupPaths)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await removeFromGroups(uhIdentifier, groupPaths)).toEqual(mockError);
        });
    });

    describe('removeIncludeMembers', () => {
        it('should make a DELETE request at the correct endpoint', async () => {
            await removeIncludeMembers(uhIdentifiers, groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/include-members`, {
                body: JSON.stringify(uhIdentifiers),
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await removeIncludeMembers(uhIdentifiers, groupingPath)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await removeIncludeMembers(uhIdentifiers, groupingPath)).toEqual(mockError);
        });
    });

    describe('removeExcludeMembers', () => {
        it('should make a DELETE request at the correct endpoint', async () => {
            await removeExcludeMembers(uhIdentifiers, groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/exclude-members`, {
                body: JSON.stringify(uhIdentifiers),
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await removeExcludeMembers(uhIdentifiers, groupingPath)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await removeExcludeMembers(uhIdentifiers, groupingPath)).toEqual(mockError);
        });
    });

    describe('removeOwners', () => {
        it('should make a DELETE request at the correct endpoint', async () => {
            await removeOwners(uhIdentifiers, groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/owners/${uhIdentifiers}`, {
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await removeOwners(uhIdentifiers, groupingPath)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await removeOwners(uhIdentifiers, groupingPath)).toEqual(mockError);
        });
    });

    describe('removeAdmin', () => {
        it('should make a DELETE request at the correct endpoint', async () => {
            await removeAdmin(uhIdentifier);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/admins/${uhIdentifier}`, {
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await removeAdmin(uhIdentifier)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await removeAdmin(uhIdentifier)).toEqual(mockError);
        });
    });

    describe('memberAttributeResults', () => {
        it('should make a POST request at the correct endpoint', async () => {
            await memberAttributeResults(uhIdentifiers);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/members`, {
                body: JSON.stringify(uhIdentifiers),
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await memberAttributeResults(uhIdentifiers)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await memberAttributeResults(uhIdentifiers)).toEqual(mockError);
        });
    });

    describe('memberAttributeResultsAsync', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should make a POST request at the correct endpoint', async () => {
            await memberAttributeResultsAsync(uhIdentifiers);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/members/async`, {
                body: JSON.stringify(uhIdentifiers),
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock
                .mockResponseOnce(JSON.stringify(0))
                .mockResponseOnce(JSON.stringify(mockAsyncInProgressResponse))
                .mockResponseOnce(JSON.stringify(mockAsyncCompletedResponse));

            const res = memberAttributeResultsAsync(uhIdentifiers);
            await vi.advanceTimersByTimeAsync(5000);

            expect(await res).toEqual(mockAsyncCompletedResponse.result);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            let res = memberAttributeResultsAsync(uhIdentifiers);
            expect(await res).toEqual(mockError);

            fetchMock.mockResponseOnce(JSON.stringify(0)).mockRejectOnce(() => Promise.reject(mockError));
            res = memberAttributeResultsAsync(uhIdentifiers);
            await vi.advanceTimersByTimeAsync(5000);
            expect(await res).toEqual(mockError);
        });
    });

    describe('optIn', () => {
        it('should make a PUT request at the correct endpoint', async () => {
            await optIn(groupingPath);
            expect(fetch).toHaveBeenCalledWith(
                `${baseUrl}/groupings/${groupingPath}/include-members/${currentUser.uid}/self`,
                {
                    headers: {
                        current_user: currentUser.uid,
                        'Content-Type': 'application/json'
                    },
                    method: 'PUT'
                }
            );
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await optIn(groupingPath)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await optIn(groupingPath)).toEqual(mockError);
        });
    });

    describe('optOut', () => {
        it('should make a PUT request at the correct endpoint', async () => {
            await optOut(groupingPath);
            expect(fetch).toHaveBeenCalledWith(
                `${baseUrl}/groupings/${groupingPath}/exclude-members/${currentUser.uid}/self`,
                {
                    headers: {
                        current_user: currentUser.uid,
                        'Content-Type': 'application/json'
                    },
                    method: 'PUT'
                }
            );
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await optOut(groupingPath)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await optOut(groupingPath)).toEqual(mockError);
        });
    });

    describe('resetIncludeGroup', () => {
        it('should make a DELETE request at the correct endpoint', async () => {
            await resetIncludeGroup(groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/include`, {
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await resetIncludeGroup(groupingPath)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await resetIncludeGroup(groupingPath)).toEqual(mockError);
        });
    });

    describe('resetIncludeGroupAsync', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should make a DELETE request at the correct endpoint', async () => {
            await resetIncludeGroupAsync(groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/include/async`, {
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock
                .mockResponseOnce(JSON.stringify(0))
                .mockResponseOnce(JSON.stringify(mockAsyncInProgressResponse))
                .mockResponseOnce(JSON.stringify(mockAsyncCompletedResponse));

            const res = resetIncludeGroupAsync(groupingPath);
            await vi.advanceTimersByTimeAsync(5000);

            expect(await res).toEqual(mockAsyncCompletedResponse.result);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            let res = resetIncludeGroupAsync(groupingPath);
            expect(await res).toEqual(mockError);

            fetchMock.mockResponseOnce(JSON.stringify(0)).mockRejectOnce(() => Promise.reject(mockError));
            res = resetIncludeGroupAsync(groupingPath);
            await vi.advanceTimersByTimeAsync(5000);
            expect(await res).toEqual(mockError);
        });
    });

    describe('resetExcludeGroup', () => {
        it('should make a DELETE request at the correct endpoint', async () => {
            await resetExcludeGroup(groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/exclude`, {
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await resetExcludeGroup(groupingPath)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await resetExcludeGroup(groupingPath)).toEqual(mockError);
        });
    });

    describe('resetExcludeGroupAsync', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should make a DELETE request at the correct endpoint', async () => {
            await resetExcludeGroupAsync(groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/exclude/async`, {
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock
                .mockResponseOnce(JSON.stringify(0))
                .mockResponseOnce(JSON.stringify(mockAsyncInProgressResponse))
                .mockResponseOnce(JSON.stringify(mockAsyncCompletedResponse));

            const res = resetExcludeGroupAsync(groupingPath);
            await vi.advanceTimersByTimeAsync(5000);

            expect(await res).toEqual(mockAsyncCompletedResponse.result);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            let res = resetExcludeGroupAsync(groupingPath);
            expect(await res).toEqual(mockError);

            fetchMock.mockResponseOnce(JSON.stringify(0)).mockRejectOnce(() => Promise.reject(mockError));
            res = resetExcludeGroupAsync(groupingPath);
            await vi.advanceTimersByTimeAsync(5000);
            expect(await res).toEqual(mockError);
        });
    });

    describe('sendFeedback', () => {
        const feedback: Feedback = {
            name: 'name',
            email: 'email@example.com',
            type: 'type',
            message: 'Message that is long enough.'
        };

        it('should make a POST request at the correct endpoint', async () => {
            await sendFeedback(feedback);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/email/send/feedback`, {
                body: JSON.stringify(feedback),
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            });
        });
    });

    describe('sendStackTrace', () => {
        const stackTrace = 'stackTrace';

        it('should make a POST request at the correct endpoint', async () => {
            await sendStackTrace(stackTrace);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/email/send/stack-trace`, {
                body: stackTrace,
                headers: {
                    current_user: currentUser.uid,
                    'Content-Type': 'text/plain'
                },
                method: 'POST'
            });
        });
    });

    describe('getGroupingMembers', () => {
        const page = 1;
        const size = 20;
        const sortBy = SortBy.NAME;
        const isAscending = true;

        it('should make a POST request at the correct endpoint', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            await getGroupingMembers(groupingPath, { sortBy, isAscending, page, size });
            expect(fetch).toHaveBeenCalledWith(
                `${baseUrl}/groupings/${groupingPath}?` +
                    `page=${page}&size=${size}&sortBy=${sortBy}&isAscending=${isAscending}`,
                {
                    headers: {
                        current_user: currentUser.uid
                    }
                }
            );
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await getGroupingMembers(groupingPath, { sortBy, isAscending, page, size })).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await getGroupingMembers(groupingPath, { sortBy, isAscending, page, size })).toEqual(mockError);
        });
    });

    describe('getNumberOfGroupingMembers', () => {
        it('should make a GET request at the correct endpoint', async () => {
            await getNumberOfGroupingMembers(groupingPath);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/count`, {
                headers: { current_user: currentUser.uid }
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await getNumberOfGroupingMembers(groupingPath)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await getNumberOfGroupingMembers(groupingPath)).toEqual(mockError);
        });
    });

    describe('getGroupingMembersIsBasis', () => {
        it('should make a POST request at the correct endpoint', async () => {
            await getGroupingMembersIsBasis(groupingPath, uhIdentifiers);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/is-basis`, {
                body: JSON.stringify(uhIdentifiers),
                headers: {
                    'Content-Type': 'application/json',
                    current_user: currentUser.uid
                },
                method: 'POST'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await getGroupingMembersIsBasis(groupingPath, uhIdentifiers)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockReject(() => Promise.reject(mockError));
            expect(await getGroupingMembersIsBasis(groupingPath, uhIdentifiers)).toEqual(mockError);
        });
    });

    describe('getGroupingMembersWhereListed', () => {
        it('should make a POST request at the correct endpoint', async () => {
            await getGroupingMembersWhereListed(groupingPath, uhIdentifiers);
            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/groupings/${groupingPath}/where-listed`, {
                body: JSON.stringify(uhIdentifiers),
                headers: {
                    'Content-Type': 'application/json',
                    current_user: currentUser.uid
                },
                method: 'POST'
            });
        });

        it('should handle the successful response', async () => {
            fetchMock.mockResponse(JSON.stringify(mockResponse));
            expect(await getGroupingMembersWhereListed(groupingPath, uhIdentifiers)).toEqual(mockResponse);
        });

        it('should handle the error response', async () => {
            fetchMock.mockRejectOnce(() => Promise.reject(mockError));
            expect(await getGroupingMembersWhereListed(groupingPath, uhIdentifiers)).toEqual(mockError);
        });
    });
});
