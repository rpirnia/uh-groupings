import { describe, it, vi, beforeEach, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OwnersModal from '@/components/modal/owners-modal';
import { GroupingGroupMember } from '@/lib/types';

vi.mock('@/lib/actions', () => ({
    groupingOwners: vi.fn()
}));

describe('OwnersModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render and open the modal and shows owners when crown icon is clicked', async () => {
        const mockOwners: GroupingGroupMember[] = [
            {
                resultCode: 'SUCCESS',
                uid: 'test-uid-1',
                uhUuid: 'test-uhUuid-1',
                name: 'test-user-1',
                firstName: 'Test-1',
                lastName: 'User-1'
            },
            {
                resultCode: 'SUCCESS',
                uid: 'test-uid-2',
                uhUuid: 'test-uhUuid-2',
                name: 'test-user-2',
                firstName: 'Test-2',
                lastName: 'User-2'
            }
        ];

        const onClose = vi.fn();

        render(
            <OwnersModal open={true} onClose={onClose} modalData={mockOwners} />
        );

        //const ownersIcon = screen.getByTestId('owners-icon');
        //expect(ownersIcon).toBeInTheDocument();

        expect(screen.getByText('Owners')).toBeInTheDocument();
        expect(screen.getByText('test-user-1')).toBeInTheDocument();
        expect(screen.getByText('test-user-2')).toBeInTheDocument();

        //mock buttons
        const closeButton = await screen.findByRole('button', { name: 'Close' });
        expect(closeButton).toBeInTheDocument();

        //expect(screen.queryByText('Owners Modal')).not.toBeInTheDocument();
    });
});
