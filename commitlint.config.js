module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'header-max-length': [0, 'always', 150],
        'type-enum': [
            2,
            'always',
            [
                'feat',
                'fix',
                'docs',
                'style',
                'refactor',
                'test',
                'revert',
                'chore',
                'perf',
                'build',
                'wip'
            ]
        ]
    }
};
