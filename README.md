[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)
[![python](https://img.shields.io/badge/Python-3.11-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![linting: pylint](https://img.shields.io/badge/linting-pylint-yellowgreen)](https://github.com/pylint-dev/pylint)
[![Checked with mypy](https://www.mypy-lang.org/static/mypy_badge.svg)](https://mypy-lang.org/)

You will need Python 3.11 and Flask.
```sh
pip install --user flask
```
I prefer to use pip with the "--user" flag.
It may be necessary to add flask to the system $PATH.
*(Linux: Prepend ~/.local/bin to $PATH.)*


**How to run:**
---------------
```sh
git clone https://github.com/dat310-2023/asdf.git
cd asdf
python app.py
firefox http://localhost:5000/
```


**Dev stuff:**
--------------
Tests:
```sh
python app.py
firefox http://localhost:5000/tests/
firefox http://localhost:5000/tests/api
```

Google style guides:
- https://google.github.io/styleguide/pyguide.html **(strict)**
- https://google.github.io/styleguide/jsguide.html *(optional)*
- https://google.github.io/styleguide/htmlcssguide.html *(optional)*

Commit convention:
- https://www.conventionalcommits.org/en/v1.0.0/ *(optional)*
- https://github.com/conventional-changelog/commitlint *(optional)*

How to install all devDependencies listed in package.json *(optional)*:
```sh
cd asdf
npm install
```
*This will install commitlint and husky git hook. The husky git hook should work
on both Linux and Mac, maybe not on Windows.*

How to install and run pylint and mypy *(optional)*:
```sh
pip install --user pylint
pip install --user mypy
cd asdf
pylint
mypy
```
I prefer to use pip with the "--user" flag.
It may be necessary to add pylint and mypy to the system $PATH.
*(Linux: Prepend ~/.local/bin to $PATH.)*

