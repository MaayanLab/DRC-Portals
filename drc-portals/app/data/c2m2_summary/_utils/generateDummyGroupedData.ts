export function generateDummyGroupedData({
    x_axis,
    group_by,
    y_axis,
}: {
    x_axis: string;
    group_by?: string | null;
    y_axis: string;
}) {
    const dummyValues: Record<string, string[]> = {
        dcc: ['MW', 'Glygen', '4DN', 'LINCS'],
        species: ['Homo sapiens', 'Mus musculus', 'Rattus novegicus'],
        ethnicity: ['Caucasian', 'Hispanic', 'Asian', 'African American'],
        sex: ['Male', 'Female'],
        race: ['White', 'Black', 'Asian', 'American Indian', 'Native Hawaiian'],
        disease: ['Diabetes', 'Cancer', "Gaucher's Disease", 'Alzheiimers'],
        granularity: ['single organism', 'multiple organisms'],
        role: ['Host', 'Pathogen'],
        anatomy: ['Liver', 'Brain', 'Blood', 'Heart'],
        biofluid: ['Saliva', 'Serum', 'Plasma'],
        sample_prep_method: ['sample preparation for sequencing assay'],
        file_format: ['TSV', 'CSV', 'ZIP', 'FASTQ'],
        assay_type: ['16s ribosomal sequencing assay', 'bulk rna-seq assay', 'bulk hi-c assay'],
        analysis_type: ['Primary', 'Secondary'],
        data_type: ['Annotation track', 'DNA sequence', 'Expression data'],
        compression_format: ['Zip format'],
    };

    const xValues = dummyValues[x_axis] ?? [`${x_axis}_1`, `${x_axis}_2`];
    const groupValues = group_by ? dummyValues[group_by] ?? [`${group_by}_1`, `${group_by}_2`] : [];

    if (group_by) {
        return xValues.map((x) => ({
            [x_axis]: x,
            ...Object.fromEntries(
                groupValues.map((g) => [g, Math.floor(Math.random() * 500)])
            ),
        }));
    } else {
        return xValues.map((x) => ({
            [x_axis]: x,
            value: Math.floor(Math.random() * 1000),
        }));
    }
}
