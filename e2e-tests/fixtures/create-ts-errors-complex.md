Tests delete-rename-write order
<mitsu-delete path="src/main.tsx">
</mitsu-delete>
<mitsu-rename from="src/App.tsx" to="src/main.tsx">
</mitsu-rename>
<mitsu-write path="src/main.tsx" description="final main.tsx file.">
finalMainTsxFileWithError();
</mitsu-write>
EOM
