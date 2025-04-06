// Add the verification status badge to the group detail page
<div className="flex items-center gap-2 mb-2">
  <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
  {group.verification_status === 'verified' && (
    <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
      <CheckCircle className="mr-1 h-3 w-3" />
      Verified
    </Badge>
  )}
</div>

// Add verification information section if the group is verified
{group.verification_status === 'verified' && group.verification_date && (
  <div className="mb-6">
    <h3 className="text-lg font-medium mb-2">Verification</h3>
    <div className="text-sm text-muted-foreground">
      <p>Verified on {new Date(group.verification_date).toLocaleDateString()}</p>
      {group.verified_by_user && (
        <p>Verified by: {group.verified_by_user.display_name}</p>
      )}
    </div>
  </div>
)} 