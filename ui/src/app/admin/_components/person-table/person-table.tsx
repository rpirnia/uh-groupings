'use client';

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    RowSelectionState,
    SortingState,
    useReactTable
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PaginationBar from '@/components/table/table-element/pagination-bar';
import GlobalFilter from '@/components/table/table-element/global-filter';
import SortArrow from '@/components/table/table-element/sort-arrow';
import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightFromSquare, faWebAwesome } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { groupingOwners, removeFromGroups } from '@/lib/actions';
import { MemberResult, MembershipResults } from '@/lib/types';
import OwnersModal from '@/components/modal/owners-modal';
import DynamicModal from '@/components/modal/dynamic-modal';
import PersonTableSkeleton from '@/app/admin/_components/person-table/person-table-skeleton';
import personTableColumns from '@/app/admin/_components/person-table/table-element/person-table-columns';
import RemoveMember from '@/app/admin/_components/person-table/table-element/remove-member';
import { Spinner } from '@/components/ui/spinner';

const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE as string);

const PersonTable = ({
    membershipResults,
    memberResult,
    uhIdentifier,
    showWarning
    }: {
    membershipResults?: MembershipResults;
    memberResult?: MemberResult;
    uhIdentifier?: undefined | string;
    showWarning: boolean;
}) => {
    // Table states
    const [isPending, startTransition] = useTransition();
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    // Modal states
    const [openOwnersModal, setOpenOwnersModal] = useState(false);
    const [ownersModalData, setOwnersModalData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalBody, setModalBody] = useState(<></>);
    const [modalWarning, setModalWarning] = useState('');
    // Search states
    const router = useRouter();
    const resultCode = membershipResults.resultCode;
    const groupingsInfo = membershipResults.results;
    const userInfo = memberResult;
    const [uid, setUid] = useState('');
    const [searchCounter, setSearchCounter] = useState(-1);
    // Other flags
    const [showRemoveWarning, setShowRemoveWarning] = useState(false);
    const [error, setError] = useState('');
    const isDisabled = resultCode !== 'SUCCESS' || groupingsInfo.length === 0;

    /**
     * Returns an error message if input to the Search bar is invalid; otherwise, returns an empty string.
     */
    const validateInput = (input: string) => {
        if (!input) return 'You must enter a UH member to search';
        if (input.includes(' ') || input.includes(',')) return 'You can only search one UH member at a time';
        return '';
    };

    /**
     * If the Enter/return keys are pressed or the Search button is clicked, starts the transition with the skeleton
     * file, resets the searchCounter, and navigates to /admin/manage-person?uhIdentifier=identifier
     *
     * @param e - The interaction or event
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            const identifier = (uid ?? '').trim().toString();
            const validationError = validateInput(identifier);

            if (validationError) {
                setError(validationError);
                showWarning = false;
                return;
            }

            setError('');
            startTransition(() => {
                setSearchCounter(0);
                table.resetRowSelection();
                router.push(`?uhIdentifier=${identifier}`);
            });
        }
    };

    /**
     * Sets up the owners modal data and opens the modal.
     *
     * @param path - The current path
     */
    const hydrateOwnersModal = async (path) => {
        const members = (await groupingOwners(path))?.owners?.members ?? [];
        setOwnersModalData(members);
        setOpenOwnersModal(true);
    };

    /**
     * Opens the remove modal if there are any checked boxes in the table. If not, shows the remove warning.
     */
    const validRemove = () => {
        const anyChecked = table.getSelectedRowModel().rows.length;
        anyChecked > 0 ? openRemoveModal() : setShowRemoveWarning(true);
    };

    /**
     * Gets the list of paths that are checked, sets up the props for the Dynamic modal, and opens the modal.
     */
    const openRemoveModal = () => {
        const selectedPaths = table
            .getSelectedRowModel()
            .rows.map(({ original }) => original.path)
            .filter(Boolean);

        setModalOpen(true);
        setModalTitle('Remove Member From Groups');
        setModalBody(<RemoveMember userInfo={userInfo} selectedPaths={selectedPaths} />
        );
        setModalWarning(
            'Membership changes made may not take effect immediately. Usually, 3-5 minutes should be\n' +
            'anticipated. In extreme cases changes may take several hours to be fully processed,\n' +
            'depending on the number of members and the synchronization destination.'
        );
    };

    /**
     * Gets all the different groupings that the uhIdentifier is being removed from, makes the API call, resets the
     * table's selection, closes the modal, and refreshes the table component.
     */
    const handleRemove = async () => {
        const groups = table.getSelectedRowModel().rows.flatMap(({ original }) => {
            const { path, inOwner, inInclude, inExclude } = original;
            return [inOwner && `${path}:owners`, inInclude && `${path}:include`, inExclude && `${path}:exclude`].filter(
                (groupPath) => groupPath
            );
        });
        await removeFromGroups(uhIdentifier, groups);
        setRowSelection({});
        setModalOpen(false);
        router.refresh();
    };

    const table = useReactTable({
        columns: personTableColumns,
        data: groupingsInfo,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { globalFilter, sorting, rowSelection },
        initialState: { pagination: { pageSize } },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection
    });

    return (
        <>
            {/* Remove Member from Grouping(s) Modal */}
            <DynamicModal
                open={modalOpen}
                title={modalTitle}
                body={modalBody}
                warning={modalWarning}
                buttons={[
                    <button onClick={() => handleRemove()} key="remove">
                        Yes
                    </button>
                ]}
                closeText="Cancel"
                onClose={() => setModalOpen(false)}
            />
            {/* Owners data Modal */}
            <OwnersModal open={openOwnersModal} onClose={() => setOpenOwnersModal(false)} modalData={ownersModalData} />
            {/* Layout for medium-sized screens and above */}
            <div className="flex-col hidden md:block mb-5">
                <div className="flex flex-row justify-between items-center pt-8 mb-1">
                    <div className="flex flex-row w-full">
                        <h1 className="text-[2rem] inline font-medium text-text-color justify-start">Manage Person</h1>
                        {isPending && <Spinner className="text-text-color ml-1 stroke-[1.5]" size="default"
                                               data-testid="spinner" />}
                        {!isPending && userInfo !== undefined && (
                            <p className="text-[1.2rem] inline font-small text-text-color justify-end px-1 pt-3">
                                {'(' + userInfo.name + ', ' + userInfo.uid + ', ' + userInfo.uhUuid + ')'}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end w-72 mb-1">
                        <GlobalFilter
                            placeholder="Filter Groupings..."
                            filter={globalFilter}
                            setFilter={setGlobalFilter}
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex flex-row justify-between items-center mb-1">
                        <label>
                            <div className="flex flex-row w-72 items-center">
                                <Input
                                    type="search"
                                    className="flex flex-col rounded-[-0.25rem] rounded-l-[0.25rem]"
                                    defaultValue={uhIdentifier === undefined || uhIdentifier === '' ? '' : uhIdentifier}
                                    placeholder="UH Username"
                                    onChange={(e) => setUid(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() => setSearchCounter(searchCounter + 1)}
                                />
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                className="rounded-[-0.25rem] rounded-r-[0.25rem] pr-3"
                                                onClick={handleKeyDown}
                                                onBlur={() => setSearchCounter(searchCounter + 1)}
                                            >
                                                Search
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side={'right'}>
                                            <p>Specify a person to manage their grouping(s)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </label>
                        <label>
                            <div>
                                Check All
                                <input
                                    className="mx-2"
                                    type="checkbox"
                                    name="checkAll"
                                    disabled={isDisabled}
                                    checked={
                                        isDisabled
                                            ? false
                                            : table.getIsAllPageRowsSelected()
                                    }
                                    onChange={table.getToggleAllPageRowsSelectedHandler()}
                                />
                                <Button
                                    variant="destructive"
                                    onClick={userInfo === undefined ? () => void 0 : validRemove}
                                    onBlur={() => setShowRemoveWarning(false)}
                                >
                                    Remove
                                </Button>
                            </div>
                        </label>
                    </div>
                    {resultCode !== 'SUCCESS' &&
                        uhIdentifier !== undefined &&
                        uhIdentifier !== '' &&
                        searchCounter < 1 &&
                        showWarning && (
                            <div className="flex flex-row justify-between">
                                <Alert variant="destructive" className="w-fit mt-2">
                                    <AlertDescription>
                                        No user data found for {uhIdentifier}. Check the entered UH member and try
                                        again.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    {error && (
                        <div className="flex flex-row justify-between">
                            <Alert variant="destructive" className="w-fit mt-2">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </div>
                    )}
                    {showRemoveWarning && (
                        <div className="w-full">
                            <Alert variant="destructive" className="w-fit float-right mt-2">
                                <AlertDescription>No Groupings have been selected.</AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
            </div>
            {/* Layout for screens smaller than medium */}
            <div className="md:hidden">
                <div className="flex flex-col justify-items-start items-center pt-8 mb-1">
                    <h1 className="text-[2rem] inline font-medium text-text-color w-full">Manage Person</h1>
                    {isPending &&
                        <Spinner className="text-text-color stroke-[1.5]" size="default" data-testid="spinner" />}
                    {!isPending && userInfo !== undefined && (
                        <p className="text-[0.1]rem inline font-small text-text-color w-full">
                            {'(' + userInfo.name + ', ' + userInfo.uid + ', ' + userInfo.uhUuid + ')'}
                        </p>
                    )}
                </div>
                <div className="flex justify-end items-center">
                    <GlobalFilter
                        placeholder="Filter Groupings..."
                        filter={globalFilter}
                        setFilter={setGlobalFilter}
                    />
                </div>
                <div className="flex flex-col w-full justify-items-start items-center mb-2">
                    <div className="w-full bg-white mb-2">
                        <label>
                            <div className="flex flex-row items-center">
                                <Input
                                    type="search"
                                    className="flex rounded-[-0.25rem] rounded-l-[0.25rem]"
                                    defaultValue={uhIdentifier === undefined || uhIdentifier === '' ? '' : uhIdentifier}
                                    placeholder="UH Username"
                                    onChange={(e) => setUid(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() => setSearchCounter(searchCounter + 1)}
                                />
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                className="rounded-[-0.25rem] rounded-r-[0.25rem] pr-3"
                                                onClick={handleKeyDown}
                                                onBlur={() => setSearchCounter(searchCounter + 1)}
                                            >
                                                Search
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side={'right'}>
                                            <p>Specify a person to manage their grouping(s)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </label>
                    </div>
                    <label>
                        <div className="flex flex-row w-full justify-between items-center mb-2">
                            <div className="flex justify-end items-center w-full">
                                <label>
                                    <div className="flex justify-end items-center w-48 ">
                                        Check All
                                        <input
                                            className="mx-2"
                                            type="checkbox"
                                            name="checkAll"
                                            disabled={isDisabled}
                                            checked={
                                                isDisabled
                                                    ? false
                                                    : table.getIsAllPageRowsSelected()
                                            }
                                            onChange={table.getToggleAllPageRowsSelectedHandler()}
                                        />
                                        <Button
                                            variant="destructive"
                                            onClick={userInfo === undefined ? () => void 0 : validRemove}
                                            onBlur={() => setShowRemoveWarning(false)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </label>
                    <div className="w-full mb-2">
                        {resultCode !== 'SUCCESS' &&
                            uhIdentifier !== undefined &&
                            uhIdentifier !== '' &&
                            searchCounter < 1 &&
                            showWarning && (
                                <Alert variant="destructive" className="max-w-fit">
                                    <AlertDescription>
                                        No user data found for {uhIdentifier}. Check the entered UH member and try
                                        again.
                                    </AlertDescription>
                                </Alert>
                            )}
                        {error && (
                            <Alert variant="destructive" className="max-w-fit">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
                {showRemoveWarning && (
                    <Alert variant="destructive" className="w-fit float-right mb-5">
                        <AlertDescription>No Groupings have been selected.</AlertDescription>
                    </Alert>
                )}
            </div>
            {/* Table layout for all screens */}
            {isPending ? (
                <PersonTableSkeleton />
            ) : (
                <Table className="relative overflow-x-auto">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className={`${header.column.id === 'name' ? 'w-1/4' : 'w-1/12'}`}
                                        data-testid={header.id}
                                    >
                                        <div className="flex items-center">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            <SortArrow direction={header.column.getIsSorted()} />
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    {userInfo !== undefined && (
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} width={cell.column.columnDef.size}>
                                            <div className="flex items-center px-2 overflow-hidden whitespace-nowrap">
                                                <div className={`m-2 ${cell.column.id === 'name' ? 'w-full' : ''}`}>
                                                    {cell.column.id === 'name' && (
                                                        <div className="flex flex-row">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <Link
                                                                            href={`/groupings/${cell.row.original.path}
                                                                            `}
                                                                            rel="noopener noreferrer"
                                                                            target="_blank"
                                                                        >
                                                                            <FontAwesomeIcon
                                                                                className="ml-1"
                                                                                icon={faUpRightFromSquare}
                                                                                data-testid={
                                                                                    'fa-up-right-from-square-icon'
                                                                                }
                                                                            />
                                                                        </Link>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent
                                                                        className="max-w-[190px] max-h-[180px]
                                                                        text-center whitespace-normal break-words
                                                                        bg-black text-white"
                                                                    >
                                                                        <p>Manage Grouping</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                            <div className="pl-3">
                                                                {flexRender(
                                                                    cell.column.columnDef.cell,
                                                                    cell.getContext()
                                                                )}
                                                            </div>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger className="ml-auto mr-3">
                                                                        <div>
                                                                            <FontAwesomeIcon
                                                                                className="ml-1"
                                                                                icon={faWebAwesome}
                                                                                data-testid={'owners-icon'}
                                                                                onClick={() =>
                                                                                    hydrateOwnersModal(
                                                                                        cell.row.original.path
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent
                                                                        className="max-w-[190px] max-h-[180px]
                                                                        text-center whitespace-normal break-words
                                                                        bg-black text-white"
                                                                        side="right"
                                                                    >
                                                                        <p>Display the grouping&apos;s owners</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    )}
                                                </div>
                                                {cell.column.id !== 'name' && (
                                                    <>{flexRender(cell.column.columnDef.cell, cell.getContext())}</>
                                                )}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    )}
                </Table>
            )}
            <div className="pt-3">
                {userInfo !== undefined && !isPending && <PaginationBar table={table} />}
            </div>
        </>
    );
};

export default PersonTable;
