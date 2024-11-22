'use client';

import { AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import React from 'react';

type RemoveMemberModalProps = {
    userInfo: {
        name?: string;
        uid?: string;
        uhUuid?: string;
    };
    selectedPaths: string[];
};

const RemoveMember: React.FC<RemoveMemberModalProps> = ({ userInfo, selectedPaths }) => {
    const list = selectedPaths
        .map((path) => path.split(':').pop())
        .filter(Boolean)
        .join(', ');

    return (
        <>
            <AlertDialogDescription>
                You are about to remove the following member from the <span>{list}</span> list(s).
            </AlertDialogDescription>
            <div className="grid grid-cols-2">
                <div className="grid">
                    <div className="grid grid-cols-3 items-center py-1 px-4">
                        <Label htmlFor="name" className="font-bold text-s text-left whitespace-nowrap">
                            NAME:
                        </Label>
                    </div>
                    <div className="grid grid-cols-3 items-center py-1 px-4">
                        <Label htmlFor="name" className="font-bold text-s text-left whitespace-nowrap">
                            UH USERNAME:
                        </Label>
                    </div>
                    <div className="grid grid-cols-3 items-center py-1 px-4">
                        <Label htmlFor="name" className="font-bold text-s text-left whitespace-nowrap">
                            UH USER ID:
                        </Label>
                    </div>
                </div>

                <div className="grid">
                    <div className="grid grid-cols-3 items-center">
                        <Label htmlFor="name" className="text-s text-left whitespace-nowrap">
                            {userInfo?.name}
                        </Label>
                    </div>
                    <div className="grid grid-cols-4 items-center">
                        <Label htmlFor="name" className="text-s text-left whitespace-nowrap">
                            {userInfo?.uid}
                        </Label>
                    </div>
                    <div className="grid grid-cols-4 items-center">
                        <Label htmlFor="name" className="text-s text-left whitespace-nowrap">
                            {userInfo?.uhUuid}
                        </Label>
                    </div>
                </div>
            </div>
            <AlertDialogDescription>
                Are you sure you want to remove{' '}
                <span
                    className="font-bold
                        text-text-color"
                >
                        {userInfo?.name}
                    </span>{' '}
                from the <span>{list}</span> list(s)?
            </AlertDialogDescription>
        </>
    );
}

export default RemoveMember;
