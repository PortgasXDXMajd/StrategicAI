'use client';

import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import Iconify from '@/components/general/Iconify';
import CompanyHelper from '@/redux/helpers/company/CompanyHelper';
import DataDialog from '@/components/dialogs/DataDialog';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { axios } from '@/utils/helpers/AxiosHelper';

// --- No changes to these helper components ---
const DynamicFieldDisplay = ({
  fields,
}: {
  fields: Record<string, any> | undefined;
}) => (
  <div className="dynamic-fields space-y-4">
    {fields &&
      Object.entries(fields).map(([key, value]) => (
        <div key={key} className="dynamic-field">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">
              {formatLabel(key)}
            </span>
            <div className="text-foreground">{renderValue(value)}</div>
          </div>
        </div>
      ))}
  </div>
);

const formatLabel = (label: string) =>
  label.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const renderValue = (value: any) => {
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {value.map((item, idx) => (
          <Badge key={idx} variant="secondary" className="font-normal">
            {item}
          </Badge>
        ))}
      </div>
    );
  } else if (typeof value === 'object' && value !== null) {
    return (
      <Card className="mt-2 bg-muted/50 border">
        <CardContent className="pt-4">
          <DynamicFieldDisplay fields={value} />
        </CardContent>
      </Card>
    );
  }
  return <span className="text-base">{value}</span>;
};

// --- Updated EmptyState to better fit the new design ---
const EmptyState = ({ onEdit }: { onEdit: () => void }) => (
  <Card className="col-span-1 lg:col-span-3">
    <CardContent>
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 flex items-center justify-center">
            <Iconify
              icon="mdi:office-building-outline"
              className="w-16 h-16 text-primary"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-primary border-4 border-background flex items-center justify-center shadow-lg">
            <Iconify
              icon="mdi:plus"
              className="w-6 h-6 text-primary-foreground"
            />
          </div>
        </div>
        <h3 className="text-2xl font-semibold text-foreground mb-2">
          Create Your Organization Profile
        </h3>
        <p className="text-muted-foreground max-w-md mb-8">
          Add your organization's information to unlock all features and provide
          us with the necessary context.
        </p>
        <Button
          onClick={onEdit}
          size="lg"
          className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Iconify icon="mdi:plus-circle" className="w-5 h-5" />
          Create Profile
        </Button>
      </div>
    </CardContent>
  </Card>
);

// --- Updated Skeleton to reflect the new two-column layout ---
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Left Column Skeleton */}
    <div className="lg:col-span-1 space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-center">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          <Skeleton className="h-7 w-3/4 mx-auto" />
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-sm" />
              <Skeleton className="h-5 w-1/2" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-sm" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    {/* Right Column Skeleton */}
    <div className="lg:col-span-2 space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

// --- Main Page Component with New Design ---
const CompanyProfilePage = () => {
  const company = useSelector((state: RootState) => state.company);
  const router = useRouter(); // <-- Initialize router
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Set to true to test skeleton

  // --- Handler functions remain the same ---
  const handleEditClick = () => setIsDialogOpen(true);
  const handleSave = async (text: string | null, files: File[] | null) => {
    setIsLoading(true);
    try {
      await CompanyHelper.enrichProfile(text, files);
      toast.success('Organization profile updated successfully');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update organization profile');
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await CompanyHelper.deleteProfile();
      toast.success('Your organization profile has been successfully deleted');
    } catch (error) {
      toast.error('Failed to delete organization profile');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const dynamicFields = company.profile?.dynamic_fields;
  const hasDynamicFields = dynamicFields && Object.keys(dynamicFields).length > 0;
  const hasProfile = company.profile?.company_name;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* --- Page Header --- */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => router.push('/')}
          >
            <Iconify icon="mdi:arrow-left" className="h-5 w-5" />
            <span className="sr-only">Back to Home</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Organization Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage your organization's details.
            </p>
          </div>
        </div>
        {hasProfile && (
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" onClick={handleEditClick}>
              <Iconify icon="mdi:pencil" className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="destructive"
              outline
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Iconify icon="mdi:delete-outline" className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* --- Main Content Area --- */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !hasProfile ? (
        <EmptyState onEdit={handleEditClick} />
      ) : (
        // --- New Two-Column Layout ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* --- Left Column: Key Info --- */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Iconify
                    icon="mdi:office-building-outline"
                    className="w-12 h-12 text-primary"
                  />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {company.profile?.company_name}
                </h2>
              </CardContent>
              <Separator />
              <CardContent className="p-6 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Iconify
                    icon="mdi:domain"
                    className="w-5 h-5 text-muted-foreground"
                  />
                  <span className="text-foreground">
                    {company.profile?.industry || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Iconify
                    icon="mdi:map-marker-outline"
                    className="w-5 h-5 text-muted-foreground"
                  />
                  <span className="text-foreground">
                    {company.profile?.country || 'Not specified'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- Right Column: Detailed Info --- */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About the Organization</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                {company.profile?.description ||
                  'No description has been provided.'}
              </CardContent>
            </Card>

            {hasDynamicFields && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <DynamicFieldDisplay fields={dynamicFields} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <DataDialog
        onSave={handleSave}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        title={hasProfile ? 'Update your profile' : 'Create your profile'}
        description={'Tell us what you want us to know about your organization'}
        onCancel={() => setIsDialogOpen(false)}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              organization profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Profile'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompanyProfilePage;