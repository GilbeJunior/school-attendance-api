const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mailer = require('../modules/mail/mailer');

const generateToken = require('../resources/util/token');

async function createUser(require, response) {

	const { email } = require.body;

	try {

		const usuario = await User.findOne({ where: { email } });

		User.beforeCreate((user, options) => {

			return bcrypt.hash(user.password, 10)
				.then(hash => {
					user.password = hash;
				})
				.catch(err => {
					throw new Error();
				});
		});

		if (usuario === null) {

			const { cnpj, cpf } = require.body;

			var newCpf, newCnpj;

			if (cnpj == undefined && cpf == undefined) {
				return response.status(401).send({
					error: 'CPF ou CNPJ é obrigatório',
				});
			} else if (cnpj == undefined) {
				newCpf = cpf;
				newCnpj = 0;

				console.log(`newCpf: ${newCpf}\nnewCnpj: ${newCnpj}`);

			} else if (cpf == undefined) {
				newCnpj = cnpj;
				newCpf = 0;

				console.log(`newCpf: ${newCpf}\nnewCnpj: ${newCnpj}`);
			}

			
			const { name, email, phone_number, password,
				zipcode, public_place, number, neighborhood, city, uf } = require.body;
		

			// console.log(`Req.body --> ${require.body.array.forEach(x => { x })}\n`);

			const newUser = await User.create({
				name,
				email,
				phone_number,
				password, 
				cpf: cpf == undefined ? newCpf : cpf,
				cnpj: cnpj == undefined ? newCnpj : cnpj,
				zipcode,
				public_place,
				number,
				neighborhood,
				city,
				uf
			});


			return response.send({
				success: true,
				newUser,
				token: generateToken({
					user: newUser.id
				}),
			});


		} else {
			return response.status(400).send({
				error: 'User already exists',
				existent_user: usuario.email
			});
		}

	} catch (err) {
		console.log(`Error: ${err}`);
		console.trace('TraceExeption');
		return response.status(400).send({ error: 'Fail to create an user', exception: err });
	}
};


async function getUsers(require, res) {

	const currentUser = await User.findAll();

	return res.send({
		user: currentUser
	});
};


async function getUserById(require, res) {

	const id = require.params.id;

	const user = await User.findByPk(id);

	if (user === null) {
		return res.status(400).send({ error: 'User not found!' });
	}

	return res.send({
		user,
		token: generateToken(user.user_id)
	});

};

async function deleteUser(require, res) {

	const id = require.params.id;

	const user = await User.findByPk(id);

	if (user === null) {
		return res.status(400).send({ error: 'User not found!' });
	}

	return res.send({ return: await user.destroy() });

}

async function authenticate(require, res) {
	const { email, password } = require.body;

	try {
		const currentUser = await User.findOne({ where: { email: email } }); // const user = await User.findOne({ email }).select('+password');

		if (!currentUser) {
			return res.status(401).send({
				success: false,
				message: 'User not found!'
			});
		}

		if (!await bcrypt.compare(password, currentUser.password)) {
			return res.status(401).send({
				success: false,
				message: 'Invalid password!'
			});

		} else {
			currentUser.password = undefined;
			return res.send({
				success: true,
				user: {
					userData: currentUser,
					token: generateToken({id: currentUser.id})
				}
			});
		}
	} catch (err) {
		console.error(`Erro é: ${err}`);
		res.status(400).send({ error: 'Error on authenticate password, try again!' });
	}
};

async function forgotPassword(require, res) {
	const { email } = require.body;

	try {

		const user = await User.findOne({ where: email });

		if (!user)
			return res.status(400).send({ error: 'User not found!' });

		const token = crypto.randomBytes(20).toString('hex');

		const now = new Date();
		now.setHours(now.getHours() + 1);

		await User.findByIdAndUpdate(user.id, {
			'$set': {
				passwordResetToken: token,
				passwordResetExpires: now,
			}
		}, {
			useFindAndModify: false
		}
		);

		mailer.sendMail({
			to: email,
			from: 'gilbertossouzajr@gmail.com',
			template: 'auth/forgot_password',
			context: { token },
		}, (err) => {
			if (err) {
				console.log(`Erro no envio do e-mail é: ${err}`);
				return res.status(400).send({ error: 'Cannot send forgot password email!' });
			}

			return res.send();
		})
	} catch (err) {
		console.log(`Erro é: ${err}`);
		res.status(400).send({ error: 'Error on forgot password, try again later!' });
	}
};

async function resetPassword(require, res) {
	const { email, token, password } = require.body;

	try {

		const user = await User.findOne({ email })
			.select('+passwordResetToken passwordResetExpires');

		if (!user)
			return res.status(400).send({ error: 'User not found!' });

		if (token !== user.passwordResetToken)
			return res.status(400).send({ error: 'Invalid token' });

		const now = new Date();

		if (now > user.passwordResetExpires)
			return res.status(400).send({ error: 'Token expired! Generate a new one' });

		user.password = password;

		await user.save();

		res.send();

	} catch (err) {
		res.status(400).send({ error: 'Error on sending email to reset password' });
	}
}

module.exports = {
	createUser,
	getUsers,
	getUserById,
	deleteUser,
	authenticate,
	forgotPassword,
	resetPassword
};